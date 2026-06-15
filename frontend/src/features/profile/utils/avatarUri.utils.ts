/** URI выбранного файла до отправки на сервер */
export function isLocalPickUri(uri: string | undefined | null): boolean {
  if (!uri) return false;
  const t = uri.trim();
  return (
    t.startsWith('file://') ||
    t.startsWith('content://') ||
    t.startsWith('ph://') ||
    t.startsWith('assets-library://') ||
    t.startsWith('blob:')
  );
}

/** Путь или URL аватара, уже сохранённого на сервере */
export function isServerStoredAvatar(uri: string | undefined | null): boolean {
  if (!uri) return false;
  const t = uri.trim();
  if (!t) return false;
  if (t.startsWith('http://') || t.startsWith('https://')) return true;
  return /^\/avatars\//.test(t);
}
