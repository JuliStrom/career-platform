import { apiClient } from '@/shared/config/api';
import { isAxiosError } from 'axios';
import { Profile } from '../model';

function isLocalFileUri(uri: string): boolean {
  const trimmed = uri.trim();
  return (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('assets-library://') ||
    trimmed.startsWith('blob:')
  );
}

function guessImageMimeType(uriOrName: string): string {
  const lower = uriOrName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

/** Имя файла для multipart (расширение влияет на путь на Яндекс.Диске). */
function avatarUploadFileName(uri: string, blob?: Blob): string {
  const mime = blob?.type?.toLowerCase() ?? '';
  if (mime.includes('png')) return 'avatar.png';
  if (mime.includes('webp')) return 'avatar.webp';
  const u = uri.toLowerCase();
  if (u.endsWith('.png') || u.includes('.png')) return 'avatar.png';
  if (u.endsWith('.webp') || u.includes('.webp')) return 'avatar.webp';
  return 'avatar.jpg';
}

function buildProfileRequestBody(profile: Profile) {
  const track = Boolean(profile.careerChangeTrackActive);
  return {
    name: profile.name,
    avatar: profile.avatar,
    direction: profile.direction,
    level: profile.level,
    skills: profile.skills,
    experience: profile.experience,
    careerGoal: profile.careerGoal,
    careerStartDate: profile.careerStartDate ?? null,
    currentCompany: profile.currentCompany ?? null,
    city: profile.city ?? null,
    relocationFromCity: profile.relocationFromCity ?? null,
    relocationToCountry: profile.relocationToCountry ?? null,
    employmentType: profile.employmentType ?? null,
    lang: profile.lang,
    wantsRelocation: profile.wantsRelocation,
    careerChangeTrackActive: track,
    careerChangeCurrentField: track
      ? (profile.careerChangeCurrentField?.trim() ?? null)
      : null,
    careerChangeTargetDirection: track
      ? (profile.careerChangeTargetDirection ?? null)
      : null,
    careerChangeAgeRange: track
      ? profile.careerChangeAgeRange === 'skip' ||
        profile.careerChangeAgeRange == null
        ? null
        : profile.careerChangeAgeRange
      : null,
    careerChangeMotivation: track
      ? (profile.careerChangeMotivation ?? null)
      : null,
    careerChangeTimeline: track ? (profile.careerChangeTimeline ?? null) : null,
  };
}

export async function uploadAvatarFile(avatarUri: string): Promise<string> {
  if (!isLocalFileUri(avatarUri)) return avatarUri;

  const formData = new FormData();

  // На web expo-image-picker часто возвращает blob: URL.
  // Для web нужен Blob/File, RN-объект { uri, name, type } не сработает.
  if (typeof window !== 'undefined') {
    const blobRes = await fetch(avatarUri);
    const blob = await blobRes.blob();
    const fileName = avatarUploadFileName(avatarUri, blob);
    formData.append('avatar', blob, fileName);

    const response = await apiClient.post<{ avatar: string }>(
      '/profile/avatar/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.avatar;
  }

  const nativeFileName = avatarUploadFileName(avatarUri);
  formData.append('avatar', {
    uri: avatarUri,
    name: nativeFileName,
    type: guessImageMimeType(nativeFileName),
  } as any);

  const response = await apiClient.post<{ avatar: string }>(
    '/profile/avatar/upload',
    formData,
    {
      headers: {
        // важно: дать axios самому проставить boundary, но RN иногда требует явный multipart
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.avatar;
}

export async function uploadPortfolioPdfFile(
  file: File
): Promise<{ portfolioPdfName: string }> {
  const formData = new FormData();
  formData.append('portfolio', file, file.name);

  const response = await apiClient.post<{ portfolioPdfName: string }>(
    '/profile/portfolio/pdf',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function getPortfolioPdfFile(): Promise<Blob> {
  const response = await apiClient.get<Blob>('/profile/portfolio/pdf', {
    responseType: 'blob',
  });

  return response.data;
}

export interface CertificatePdfMetadata {
  _id: string;
  name: string;
  contentType?: string;
  uploadedAt?: string | Date;
}

export async function uploadCertificatePdfFile(
  file: File
): Promise<CertificatePdfMetadata> {
  const formData = new FormData();
  formData.append('certificate', file, file.name);

  const response = await apiClient.post<{
    certificate: CertificatePdfMetadata;
  }>('/profile/certificates/pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.certificate;
}

export async function getCertificatePdfFile(id: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/profile/certificates/pdf/${id}`,
    {
      responseType: 'blob',
    }
  );

  return response.data;
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const response = await apiClient.get<Profile>('/profile');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createProfile(body: Profile): Promise<Profile> {
  try {
    const response = await apiClient.post<Profile>(
      '/profile',
      buildProfileRequestBody(body)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateProfile(body: Profile): Promise<Profile> {
  try {
    const response = await apiClient.put<Profile>(
      '/profile',
      buildProfileRequestBody(body)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProfile(): Promise<void> {
  try {
    await apiClient.delete('/profile');
  } catch (error) {
    throw error;
  }
}

export async function deleteAvatar(): Promise<Profile> {
  const response = await apiClient.delete<Profile>('/profile/avatar');
  return response.data;
}
