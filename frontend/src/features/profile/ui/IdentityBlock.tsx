import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';

interface IdentityBlockProps {
  name: string;
}

export const IdentityBlock = ({ name }: IdentityBlockProps) => {
  const { t } = useTranslation('profile');

  return (
    <View className="mb-6">
      <Text
        className="mb-1 text-xs text-gray-500 dark:text-gray-400"
        accessibilityLabel={t('accessibility.nameLabel')}
      >
        {t('name')}
      </Text>
      <Text
        className="text-2xl font-bold text-gray-900 dark:text-white"
        accessibilityLabel={t('accessibility.nameValue', { name })}
      >
        {name}
      </Text>
    </View>
  );
};
