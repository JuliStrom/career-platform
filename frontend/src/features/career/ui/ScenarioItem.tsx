import type { CareerScenario } from '@/features/career/model';
import { getScenarioAuthorEmail } from '@/features/career/lib/scenarioAuthor';
import { Pressable, Text, View } from 'react-native';

interface ScenarioItemProps {
  handleOpenScenario: (id: string) => void;
  item: CareerScenario;
  t: (key: string, options?: Record<string, unknown>) => string;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ScenarioItem({
  handleOpenScenario,
  item,
  t,
  isAdmin,
  onEdit,
  onDelete,
}: ScenarioItemProps) {
  const directionText = t(`directions.${item.direction}`) || item.direction;
  const levelText = t(`levels.${item.level}`) || item.level;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Pressable
      onPress={() => handleOpenScenario(item._id)}
      className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
    >
      <View className="mb-3 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900">
          <Text className="text-xs font-semibold text-blue-800 dark:text-blue-200">
            {directionText}
          </Text>
        </View>
        <View className="rounded-full bg-purple-100 px-3 py-1.5 dark:bg-purple-900">
          <Text className="text-xs font-semibold text-purple-800 dark:text-purple-200">
            {levelText}
          </Text>
        </View>
        <View
          className={`rounded-full px-3 py-1.5 ${
            item.isActive
              ? 'bg-green-100 dark:bg-green-900'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              item.isActive
                ? 'text-green-800 dark:text-green-200'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {item.isActive
              ? t('scenarios.status.active')
              : t('scenarios.status.inactive')}
          </Text>
        </View>
      </View>

      <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {item.title}
      </Text>

      <Text
        className="mb-3 text-sm text-gray-600 dark:text-gray-300"
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('scenarios.createdBy')}: {getScenarioAuthorEmail(item)}
          </Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('scenarios.createdAt')}: {formatDate(item.createdAt)}
          </Text>
        </View>
        {isAdmin && onEdit && onDelete && (
          <View className="ml-2 flex-row gap-2">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit(item._id);
              }}
              className="rounded-lg bg-blue-600 px-3 py-1.5 dark:bg-blue-500"
              hitSlop={8}
              accessibilityLabel={t('scenarios.edit')}
            >
              <Text className="text-xs font-semibold text-white">
                {t('scenarios.edit')}
              </Text>
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 dark:bg-red-500"
              hitSlop={8}
              accessibilityLabel={t('scenarios.delete')}
            >
              <Text className="text-xs font-semibold text-white">
                {t('scenarios.delete')}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {t('scenarios.actionsCount', { count: item.actions.length })}
      </Text>
    </Pressable>
  );
}
