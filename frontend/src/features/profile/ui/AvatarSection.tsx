import { useAvatarDisplaySource } from '@/features/profile/lib/useAvatarDisplaySource';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

interface AvatarSectionProps {
  avatar?: string;
  name: string;
}

export const AvatarSection = ({ avatar, name }: AvatarSectionProps) => {
  const { t } = useTranslation('profile');

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarLabel = avatar
    ? t('accessibility.avatarWithName', { name })
    : t('accessibility.avatar');

  const imageSource = useAvatarDisplaySource(avatar?.trim() || null);

  return (
    <View className="mb-6 items-center justify-center">
      <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {imageSource ? (
          <Image
            source={imageSource as never}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="none"
            accessibilityLabel={avatarLabel}
            accessibilityRole="image"
          />
        ) : (
          <Text
            className="text-2xl font-bold text-gray-600 dark:text-gray-300"
            accessibilityLabel={avatarLabel}
          >
            {initials}
          </Text>
        )}
      </View>
    </View>
  );
};
