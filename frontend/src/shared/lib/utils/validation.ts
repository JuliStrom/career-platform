import i18n from '@/shared/config/i18n';

export function getValidationMessage(key: string, namespace: string): string {
  return i18n.t(`validation.${key}`, {
    ns: namespace,
    defaultValue: key,
  });
}
