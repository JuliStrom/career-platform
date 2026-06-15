import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TermOfService() {
  const { from } = useLocalSearchParams();
  const { t } = useTranslation('terms');

  return (
    <View className="flex-1">
      <View className="mt-4 flex-row items-center justify-between border-b border-gray-300 px-4 py-3">
        <TouchableOpacity
          onPress={() =>
            from ? router.push({ pathname: from as any }) : router.back()
          }
        >
          <Text className="text-base text-blue-600">{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="text-base text-blue-600">{t('home')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="px-6 py-6">
        <Text className="mb-4 text-center text-2xl font-bold">
          {t('title')}
        </Text>
        <Text className="text-base leading-relaxed">{t('content')}</Text>
      </ScrollView>
    </View>
  );
}
