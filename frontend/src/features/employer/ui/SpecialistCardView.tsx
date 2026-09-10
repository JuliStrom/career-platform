import type { SpecialistCard } from '@/features/employer/model';
import { normalizeProfileDirections } from '@/features/profile/utils/directions.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { EmployerContactKind } from '@/shared/model';
import { NamedField } from '@/shared/ui';
import { FilterSecondaryButton } from '@/shared/ui/buttons/FilterSecondaryButton';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface SpecialistCardViewProps {
  item: SpecialistCard;
  isContacting: boolean;
  onContact: (kind: EmployerContactKind, message?: string) => Promise<void>;
}

export function SpecialistCardView({
  item,
  isContacting,
  onContact,
}: SpecialistCardViewProps) {
  const { t } = useTranslation('employer');
  const { t: tProfile } = useTranslation('profile');
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [kind, setKind] = useState<EmployerContactKind | null>(null);

  const handleSend = async () => {
    if (!kind) return;
    await onContact(kind, message.trim() || undefined);
    setKind(null);
    setMessage('');
  };

  return (
    <View className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      {item.aboutMe?.trim() ? (
        <Text className="mb-2 text-sm leading-5 text-gray-700 dark:text-gray-200">
          {item.aboutMe.trim()}
        </Text>
      ) : null}
      <Text className="text-base font-semibold text-gray-900 dark:text-white">
        {item.name}
      </Text>
      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {normalizeProfileDirections(item.directions)
          .map((itemDirection) => tProfile(`directions.${itemDirection}`))
          .join(', ')} ·{' '}
        {tProfile(`levels.${item.level}`)}
        {item.city ? ` · ${tProfile(`cities.${item.city}`)}` : ''}
      </Text>
      <Text className="mt-2 text-sm text-gray-700 dark:text-gray-200">
        {t('specialists.careerGoal')}:{' '}
        {tProfile(`careerGoals.${item.careerGoal}`)}
      </Text>
      <View className="mt-3 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
        {item.currentCompany ? (
          <Text className="text-sm text-gray-700 dark:text-gray-200">
            {tProfile('currentCompany')}: {item.currentCompany}
          </Text>
        ) : null}
        {item.employmentType ? (
          <Text className="text-sm text-gray-700 dark:text-gray-200">
            {t('specialists.employment')}:{' '}
            {tProfile(`employmentTypes.${item.employmentType}`)}
          </Text>
        ) : null}
        <Text className="text-sm text-gray-700 dark:text-gray-200">
          {tProfile(`relocationOptions.${item.wantsRelocation === true}`)}
          {item.wantsRelocation && item.relocationToCountry
            ? ` · ${tProfile(`relocationCountries.${item.relocationToCountry}`, { defaultValue: item.relocationToCountry })}`
            : ''}
        </Text>
      </View>
      {item.experience?.trim() ? (
        <View className="mt-4">
          <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
            {tProfile('experience')}
          </Text>
          <Text className="text-sm leading-6 text-gray-700 dark:text-gray-200">
            {expanded || item.experience.length <= 240
              ? item.experience
              : `${item.experience.slice(0, 240).trimEnd()}…`}
          </Text>
          {item.experience.length > 240 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setExpanded((value) => !value)}
              className="self-start py-2"
            >
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {t(expanded ? 'specialists.showLess' : 'specialists.showMore')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {item.skills.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {item.skills.map((skill) => (
            <View
              key={skill}
              className="rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-950"
            >
              <Text className="text-xs text-blue-700 dark:text-blue-300">
                {skill}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {kind ? (
        <View className="mt-4">
          <NamedField
            label={
              kind === EmployerContactKind.ProjectOffer
                ? t('specialists.offer')
                : t('specialists.write')
            }
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            placeholder={t('specialists.messagePlaceholder')}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FilterSecondaryButton
                label={t('specialists.cancel')}
                onPress={() => {
                  setKind(null);
                  setMessage('');
                }}
              />
            </View>
            <View className="flex-1">
              <PrimaryButton
                className="mb-0"
                isLoading={isContacting}
                onPress={() => void handleSend()}
              >
                {t('specialists.send')}
              </PrimaryButton>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <FilterSecondaryButton
              label={t('specialists.write')}
              onPress={() => setKind(EmployerContactKind.Message)}
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              className="mb-0"
              onPress={() => setKind(EmployerContactKind.ProjectOffer)}
            >
              {t('specialists.offer')}
            </PrimaryButton>
          </View>
        </View>
      )}
    </View>
  );
}
