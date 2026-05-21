import { useAvatarDisplaySource } from '@/features/profile/lib/useAvatarDisplaySource';
import {
  isLocalPickUri,
  isServerStoredAvatar,
} from '@/features/profile/utils/avatarUri.utils';
import { validatePickedImageAsset } from '@/features/profile/utils/validateAvatarImage';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

export interface ProfileAvatarUploadProps {
  value: string;
  onChange: (uri: string) => void;
  /** Сохранённый на сервере путь/URL до локального выбора (для отката) */
  baselineServerAvatar: string;
  displayName: string;
  disabled?: boolean;
  isDeleting?: boolean;
  /** Удаление аватара на сервере (экран редактирования) */
  onDeleteServerAvatar?: () => Promise<void>;
  /** Ошибка из react-hook-form по полю avatar */
  fieldError?: string;
}

export function ProfileAvatarUpload({
  value,
  onChange,
  baselineServerAvatar,
  displayName,
  disabled = false,
  isDeleting = false,
  onDeleteServerAvatar,
  fieldError,
}: ProfileAvatarUploadProps) {
  const { t } = useTranslation('profile');
  const [pickError, setPickError] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [hovered, setHovered] = useState(false);

  const blobToRevokeRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = blobToRevokeRef.current;
    if (prev?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(prev);
      } catch {
        /* ignore */
      }
    }
    blobToRevokeRef.current = value.startsWith('blob:') ? value : null;
  }, [value]);

  useEffect(() => {
    return () => {
      const cur = blobToRevokeRef.current;
      if (cur?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(cur);
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const imageSource = useAvatarDisplaySource(value.trim() || null);

  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const trimmed = value.trim();
  const showImage = Boolean(trimmed && imageSource != null);
  const loadingServerAvatar =
    Boolean(trimmed) &&
    isServerStoredAvatar(value) &&
    !isLocalPickUri(value) &&
    imageSource === null;

  const busy = disabled || isPicking || isDeleting;
  const showRemove =
    trimmed !== '' &&
    (isLocalPickUri(value) ||
      isServerStoredAvatar(value) ||
      trimmed.startsWith('http'));

  const openPicker = useCallback(async () => {
    if (busy) return;
    setPickError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (Platform.OS === 'web') {
        window.alert(t('pickAvatarPermissionDenied'));
      } else {
        Alert.alert(t('pickAvatarPermissionDenied'));
      }
      return;
    }

    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const validation = validatePickedImageAsset(asset);
      if (!validation.ok) {
        setPickError(t(`validation.${validation.errorKey}`));
        return;
      }

      onChange(asset.uri);
    } finally {
      setIsPicking(false);
    }
  }, [busy, onChange, t]);

  const handleRemove = useCallback(async () => {
    if (busy) return;
    setPickError(null);

    if (isLocalPickUri(value)) {
      onChange(baselineServerAvatar ?? '');
      return;
    }

    if (isServerStoredAvatar(value) && onDeleteServerAvatar) {
      try {
        await onDeleteServerAvatar();
      } catch {
        /* store показывает ошибку */
      }
      return;
    }

    if (value.trim().startsWith('http')) {
      if (onDeleteServerAvatar) {
        try {
          await onDeleteServerAvatar();
        } catch {
          /* */
        }
      } else {
        onChange('');
      }
      return;
    }

    onChange('');
  }, [baselineServerAvatar, busy, onChange, onDeleteServerAvatar, value]);

  const showOverlay = Platform.OS === 'web' ? hovered && !busy : false;
  const avatarLabel = showImage
    ? t('accessibility.avatarWithName', { name: displayName || t('name') })
    : t('accessibility.avatar');

  const combinedError = fieldError || pickError;

  return (
    <View className="mb-6">
      <Text className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('avatarPhotoLabel')}
      </Text>

      <View className="flex-row items-start gap-4">
        <Pressable
          onPress={openPicker}
          disabled={busy}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          accessibilityRole="button"
          accessibilityLabel={t('avatarChangePhoto')}
          className="active:opacity-90"
        >
          <View className="relative h-28 w-28 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            {showImage ? (
              <Image
                source={imageSource as never}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="none"
                accessibilityLabel={avatarLabel}
                accessibilityRole="image"
              />
            ) : loadingServerAvatar ? (
              <View className="h-full w-full items-center justify-center">
                <ActivityIndicator size="large" color="#6b7280" />
              </View>
            ) : (
              <View className="h-full w-full items-center justify-center">
                {initials ? (
                  <Text className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                    {initials}
                  </Text>
                ) : (
                  <MaterialIcons
                    name="person"
                    size={48}
                    color={Platform.OS === 'web' ? '#9ca3af' : '#9CA3AF'}
                  />
                )}
              </View>
            )}

            {(isPicking || isDeleting) && (
              <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
                <ActivityIndicator color="#ffffff" />
              </View>
            )}

            {showOverlay && !isPicking && !isDeleting ? (
              <View
                className="absolute inset-0 items-center justify-center rounded-full bg-black/50"
                pointerEvents="none"
              >
                <MaterialIcons name="photo-camera" size={32} color="#ffffff" />
                <Text className="mt-1 text-xs font-medium text-white">
                  {t('avatarChangePhotoShort')}
                </Text>
              </View>
            ) : null}

            {Platform.OS !== 'web' && !busy ? (
              <View
                className="absolute bottom-1 right-1 rounded-full bg-gray-900/80 p-1.5"
                pointerEvents="none"
              >
                <MaterialIcons name="photo-camera" size={18} color="#ffffff" />
              </View>
            ) : null}
          </View>
        </Pressable>

        <View className="min-w-0 flex-1 justify-center gap-2 py-1">
          <Pressable
            onPress={openPicker}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('avatarChangePhoto')}
          >
            <Text className="text-base font-semibold text-blue-600 dark:text-blue-400">
              {trimmed ? t('avatarChangePhoto') : t('avatarChoosePhoto')}
            </Text>
          </Pressable>

          {showRemove ? (
            <Pressable
              onPress={handleRemove}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={t('avatarRemovePhoto')}
            >
              <Text className="text-sm text-red-600/90 dark:text-red-400/90">
                {t('avatarRemovePhoto')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {t('avatarHelperHint')}
      </Text>

      {combinedError ? (
        <Text
          className="mt-2 text-sm text-red-600 dark:text-red-400"
          accessibilityLiveRegion="polite"
        >
          {combinedError}
        </Text>
      ) : null}
    </View>
  );
}
