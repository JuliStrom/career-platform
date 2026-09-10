/**
 * Пересобирает логотип из исходного PNG на белом фоне:
 *  - logo.png       — прозрачный фон (белая подложка выбита флуд-филлом от краёв)
 *  - logo-dark.png  — та же геометрия, тёмные части осветлены для тёмной темы
 *
 * Запуск (из папки frontend): node scripts/build-logo-assets.mjs [source.png]
 */
import { deflateSync, inflateSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const BACKGROUND_WHITENESS = 240;
const EDGE_SOFT_START = 200;
const TARGET_WIDTH = 724;

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function readChunks(file) {
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Не PNG-файл');
  }
  const chunks = [];
  let offset = 8;
  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString('ascii', offset + 4, offset + 8);
    const data = file.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += length + 12;
  }
  return chunks;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function unfilter(raw, width, height, channels) {
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const outRow = y * stride;
    const prevRow = outRow - stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? out[outRow + x - channels] : 0;
      const up = y > 0 ? out[prevRow + x] : 0;
      const upLeft = y > 0 && x >= channels ? out[prevRow + x - channels] : 0;
      let value = line[x];
      switch (filter) {
        case 0:
          break;
        case 1:
          value += left;
          break;
        case 2:
          value += up;
          break;
        case 3:
          value += (left + up) >> 1;
          break;
        case 4:
          value += paeth(left, up, upLeft);
          break;
        default:
          throw new Error(`Неизвестный фильтр PNG: ${filter}`);
      }
      out[outRow + x] = value & 0xff;
    }
  }
  return out;
}

function decodeRgb(filePath) {
  const chunks = readChunks(readFileSync(filePath));
  const ihdr = chunks.find((chunk) => chunk.type === 'IHDR');
  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data[8];
  const colorType = ihdr.data[9];
  const interlace = ihdr.data[12];
  if (
    bitDepth !== 8 ||
    interlace !== 0 ||
    (colorType !== 2 && colorType !== 6)
  ) {
    throw new Error(
      `Поддерживается только 8-битный RGB/RGBA без интерлейса, получено: depth=${bitDepth} colorType=${colorType} interlace=${interlace}`
    );
  }
  const channels = colorType === 6 ? 4 : 3;
  const idat = Buffer.concat(
    chunks.filter((chunk) => chunk.type === 'IDAT').map((chunk) => chunk.data)
  );
  const pixels = unfilter(inflateSync(idat), width, height, channels);
  return { width, height, channels, pixels };
}

function encodeRgba(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const chunk = (type, data) => {
    const out = Buffer.alloc(data.length + 12);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    data.copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Белый фон — это область, связанная с краями картинки, а не светлые детали внутри логотипа. */
function markBackground(pixels, width, height, channels) {
  const isBackground = new Uint8Array(width * height);
  const whiteness = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * channels;
    whiteness[i] = Math.min(pixels[o], pixels[o + 1], pixels[o + 2]);
  }

  const stack = [];
  const push = (index) => {
    if (!isBackground[index] && whiteness[index] >= BACKGROUND_WHITENESS) {
      isBackground[index] = 1;
      stack.push(index);
    }
  };
  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length > 0) {
    const index = stack.pop();
    const x = index % width;
    const y = (index - x) / width;
    if (x > 0) push(index - 1);
    if (x < width - 1) push(index + 1);
    if (y > 0) push(index - width);
    if (y < height - 1) push(index + width);
  }

  return { isBackground, whiteness };
}

function toTransparentRgba(source, { lightenDark }) {
  const { width, height, channels, pixels } = source;
  const { isBackground, whiteness } = markBackground(
    pixels,
    width,
    height,
    channels
  );
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i += 1) {
    const src = i * channels;
    const dst = i * 4;
    if (isBackground[i]) {
      continue;
    }

    const w = whiteness[i];
    // Сглаживание по краям: чем ближе пиксель к белому, тем он прозрачнее.
    const alpha =
      w >= EDGE_SOFT_START
        ? Math.round(((255 - w) * 255) / (255 - EDGE_SOFT_START))
        : 255;
    if (alpha <= 0) {
      continue;
    }

    const channelsOut = [0, 1, 2].map((c) => {
      // Убираем вклад белой подложки, чтобы цвет не бледнел на прозрачности.
      const value = ((pixels[src + c] - (255 - alpha)) * 255) / alpha;
      return Math.max(0, Math.min(255, value));
    });

    if (lightenDark) {
      const [r, g, b] = channelsOut;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const mix = Math.max(0, Math.min(0.88, 1 - luminance / 150));
      for (let c = 0; c < 3; c += 1) {
        channelsOut[c] = channelsOut[c] + (255 - channelsOut[c]) * mix;
      }
    }

    rgba[dst] = Math.round(channelsOut[0]);
    rgba[dst + 1] = Math.round(channelsOut[1]);
    rgba[dst + 2] = Math.round(channelsOut[2]);
    rgba[dst + 3] = alpha;
  }

  return { width, height, rgba };
}

/** Усреднение по площади с premultiplied alpha — иначе на краях появляется гало. */
function resizeRgba(image, targetWidth) {
  const { width, height, rgba } = image;
  if (targetWidth >= width) {
    return image;
  }
  const targetHeight = Math.max(1, Math.round((height * targetWidth) / width));
  const out = Buffer.alloc(targetWidth * targetHeight * 4);
  const scaleX = width / targetWidth;
  const scaleY = height / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const y0 = Math.floor(y * scaleY);
    const y1 = Math.min(height, Math.ceil((y + 1) * scaleY));
    for (let x = 0; x < targetWidth; x += 1) {
      const x0 = Math.floor(x * scaleX);
      const x1 = Math.min(width, Math.ceil((x + 1) * scaleX));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const o = (sy * width + sx) * 4;
          const alpha = rgba[o + 3] / 255;
          r += rgba[o] * alpha;
          g += rgba[o + 1] * alpha;
          b += rgba[o + 2] * alpha;
          a += alpha;
          count += 1;
        }
      }
      const dst = (y * targetWidth + x) * 4;
      if (count === 0 || a === 0) {
        continue;
      }
      out[dst] = Math.round(r / a);
      out[dst + 1] = Math.round(g / a);
      out[dst + 2] = Math.round(b / a);
      out[dst + 3] = Math.round((a / count) * 255);
    }
  }

  return { width: targetWidth, height: targetHeight, rgba: out };
}

const sourcePath = process.argv[2] ?? 'scripts/logo-source.png';
const source = decodeRgb(sourcePath);

for (const [target, options] of [
  ['assets/images/logo.png', { lightenDark: false }],
  ['assets/images/logo-dark.png', { lightenDark: true }],
]) {
  const image = resizeRgba(toTransparentRgba(source, options), TARGET_WIDTH);
  writeFileSync(target, encodeRgba(image.width, image.height, image.rgba));
  console.log(`${target}: ${image.width}x${image.height}`);
}
