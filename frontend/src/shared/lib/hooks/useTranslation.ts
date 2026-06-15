import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  return {
    t: (key: string, options?: Record<string, unknown>) => {
      try {
        const translation = t(key, options);
        return translation || key;
      } catch (error) {
        console.warn(`Translation error for key "${key}":`, error);
        return key;
      }
    },
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    currentLanguage: i18n.language,
    ready,
  };
};
