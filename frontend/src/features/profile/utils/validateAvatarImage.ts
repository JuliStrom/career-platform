import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

function normalizeMime(m: string): string {
  const x = m.toLowerCase().trim();
  return x === 'image/jpg' ? 'image/jpeg' : x;
}

function extToMime(ext: string): string | null {
  const e = ext.toLowerCase().replace(/^\./, '');
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'png') return 'image/png';
  if (e === 'webp') return 'image/webp';
  return null;
}

function inferMimeFromFileName(name: string | undefined | null): string | null {
  if (!name) return null;
  const dot = name.lastIndexOf('.');
  if (dot < 0) return null;
  return extToMime(name.slice(dot));
}

export type AvatarValidationErrorKey =
  | 'avatarValidationType'
  | 'avatarValidationSize';

export function validatePickedImageAsset(
  asset: ImagePickerAsset
): { ok: true } | { ok: false; errorKey: AvatarValidationErrorKey } {
  const webFile = asset.file;

  if (Platform.OS === 'web' && webFile) {
    const m = normalizeMime(webFile.type || '');
    if (!ALLOWED.has(m)) {
      return { ok: false, errorKey: 'avatarValidationType' };
    }
    if (typeof webFile.size === 'number' && webFile.size > AVATAR_MAX_BYTES) {
      return { ok: false, errorKey: 'avatarValidationSize' };
    }
    return { ok: true };
  }

  const fromMime = normalizeMime(asset.mimeType || '');
  const fromName = inferMimeFromFileName(asset.fileName ?? '');
  const resolved = fromMime || (fromName ? normalizeMime(fromName) : '');

  if (resolved && ALLOWED.has(resolved)) {
    const size = asset.fileSize;
    if (typeof size === 'number' && size > AVATAR_MAX_BYTES) {
      return { ok: false, errorKey: 'avatarValidationSize' };
    }
    return { ok: true };
  }

  if (!resolved && asset.type === 'image') {
    const size = asset.fileSize;
    if (typeof size === 'number' && size > AVATAR_MAX_BYTES) {
      return { ok: false, errorKey: 'avatarValidationSize' };
    }
    return { ok: true };
  }

  return { ok: false, errorKey: 'avatarValidationType' };
}
