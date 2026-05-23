import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { setLanguage } from '@/shared/config/i18n';
import { Pressable, Text, View } from 'react-native';

export function LanguageSwitcher() {
  const { t, currentLanguage } = useTranslation('common');
  const currentLang = currentLanguage?.slice(0, 2) || 'ru';

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        {t('language')}:
      </Text>
      <View className="flex-row rounded-lg border border-gray-300 dark:border-gray-600">
        <Pressable
          onPress={() => setLanguage('ru')}
          className={`px-3 py-2 ${currentLang === 'ru' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
        >
          <Text
            className={`text-sm font-medium ${
              currentLang === 'ru'
                ? 'text-blue-800 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('languageRu')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setLanguage('en')}
          className={`rounded-r-lg px-3 py-2 ${
            currentLang === 'en' ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              currentLang === 'en'
                ? 'text-blue-800 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('languageEn')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
