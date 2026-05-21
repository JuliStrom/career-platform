import type { Job } from '@/features/jobs/model';
import { formatSalary } from '@/features/jobs/utils/job-form.utils';
import { useColorScheme, Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface JobItemProps {
  handleOpenJob: (id: string) => void;
  item: Job;
  t: (key: string, options?: Record<string, unknown>) => string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function JobItem({
  handleOpenJob,
  item,
  t,
  isFavorite,
  onToggleFavorite,
}: JobItemProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  return (
    <Pressable
      onPress={() => handleOpenJob(item._id)}
      className="mb-3 rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50 active:opacity-95 dark:bg-gray-800 dark:hover:bg-gray-700/40"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {item.title}
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {item.company}
          </Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {item.location} • {item.workFormat}
          </Text>
          {item.salary && (
            <Text className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
              {formatSalary(item.salary, t)}
            </Text>
          )}
        </View>
        {onToggleFavorite && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(item._id);
            }}
            hitSlop={8}
            className="rounded-full p-1 hover:bg-gray-200/80 active:opacity-70 dark:hover:bg-gray-600/40"
            accessibilityLabel={
              isFavorite ? t('removeFromFavorites') : t('addToFavorites')
            }
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#EF4444' : iconColor}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
