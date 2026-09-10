import { suggestSkills, type SkillSuggestion } from '@/features/profile/api/skills.api';
import {
  MAX_PROFILE_SKILLS,
  addProfileSkill,
  normalizeSkillName,
  skillKey,
} from '@/features/profile/utils/skills.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { isAxiosError } from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

interface SkillsAutosuggestProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  touched?: boolean;
}

function isAbortError(error: unknown): boolean {
  if (isAxiosError(error) && error.code === 'ERR_CANCELED') return true;
  return error instanceof Error && error.name === 'CanceledError';
}

export function SkillsAutosuggest({
  value,
  onChange,
  error,
  touched,
}: SkillsAutosuggestProps) {
  const { t } = useTranslation('profile');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastCommitKey = useRef('');

  const atLimit = value.length >= MAX_PROFILE_SKILLS;
  const typed = normalizeSkillName(query);
  const typedKey = skillKey(typed);
  const alreadySelected = typed
    ? value.some((item) => skillKey(item) === typedKey)
    : false;
  const selectedKeys = useMemo(
    () => new Set(value.map(skillKey)),
    [value]
  );
  const visibleSuggestions = useMemo(
    () =>
      suggestions.filter((item) => !selectedKeys.has(skillKey(item.name))),
    [selectedKeys, suggestions]
  );
  const matchesSuggestion = visibleSuggestions.some(
    (item) => skillKey(item.name) === typedKey
  );
  const canAddCustom = Boolean(typed) && !alreadySelected && !atLimit;

  useEffect(() => {
    lastCommitKey.current = '';
  }, [typedKey]);

  useEffect(() => {
    if (!typed || atLimit) {
      setSuggestions([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      setLoadError(null);
      suggestSkills(typed, controller.signal)
        .then((items) => {
          setSuggestions(items);
        })
        .catch((error: unknown) => {
          if (isAbortError(error)) return;
          setSuggestions([]);
          setLoadError(t('skillsLoadError'));
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [typed, atLimit, t]);

  const addSkill = (name: string) => {
    const next = addProfileSkill(value, name);
    if (next === value) return;
    onChange(next);
    setQuery('');
    setSuggestions([]);
    setLoadError(null);
  };

  const commitTyped = () => {
    if (!canAddCustom || lastCommitKey.current === typedKey) return;
    lastCommitKey.current = typedKey;
    addSkill(typed);
  };

  const handleQueryChange = (text: string) => {
    if (text.includes(',') || text.includes('\n')) {
      const parts = text.split(/[,،\n]+/);
      const last = parts.pop() ?? '';
      let next = value;
      for (const part of parts) {
        next = addProfileSkill(next, part);
      }
      if (next !== value) onChange(next);
      setQuery(last);
      return;
    }
    setQuery(text);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('skills')}
      </Text>
      <Text className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {t('skillsHint')}
      </Text>

      {value.length > 0 ? (
        <View className="mb-2 flex-row flex-wrap gap-2">
          {value.map((skill) => (
            <Pressable
              key={skillKey(skill)}
              onPress={() =>
                onChange(value.filter((item) => skillKey(item) !== skillKey(skill)))
              }
              className="rounded-full bg-blue-600 px-3 py-1.5 dark:bg-blue-500"
              accessibilityRole="button"
              accessibilityLabel={`${t('skillsRemove')} ${skill}`}
            >
              <Text className="text-sm text-white">{skill} ×</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <TextInput
        value={query}
        onChangeText={handleQueryChange}
        onSubmitEditing={commitTyped}
        onKeyPress={(event) => {
          if (event.nativeEvent.key !== 'Enter') return;
          event.preventDefault?.();
          commitTyped();
        }}
        placeholder={t('skillsPlaceholder')}
        placeholderTextColor="#9CA3AF"
        editable={!atLimit}
        returnKeyType="done"
        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        accessibilityLabel={t('skills')}
      />

      {typed && !atLimit ? (
        <View className="mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {isLoading ? (
            <View className="flex-row items-center gap-2 px-3 py-2">
              <ActivityIndicator size="small" />
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('skillsLoading')}
              </Text>
            </View>
          ) : null}

          {loadError ? (
            <Text className="px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {loadError}
            </Text>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={{ maxHeight: 192 }}
            >
              {visibleSuggestions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => addSkill(item.name)}
                  className="border-b border-gray-100 px-3 py-2 dark:border-gray-700"
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-900 dark:text-white">
                    {item.name}
                  </Text>
                  {item.category ? (
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {item.category.name}
                    </Text>
                  ) : null}
                </Pressable>
              ))}

              {!isLoading &&
              visibleSuggestions.length === 0 &&
              !canAddCustom ? (
                <Text className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {alreadySelected
                    ? t('skillsAlreadyAdded')
                    : t('skillsNoResults')}
                </Text>
              ) : null}

              {canAddCustom && !matchesSuggestion ? (
                <Pressable
                  onPress={commitTyped}
                  className="px-3 py-2"
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-blue-600 dark:text-blue-400">
                    {t('skillsAddCustom', { name: typed })}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          )}
        </View>
      ) : null}

      {error && touched ? (
        <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
