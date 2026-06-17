import {
  createCompany,
  type CompanyPayload,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { CompanyForm } from '@/features/admin/ui/CompanyForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function AdminCreateCompanyScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: CompanyPayload) {
    setLoading(true);
    setError(null);
    try {
      await createCompany(payload);
      router.replace('/admin/companies' as never);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AdminHeader title={t('adminCompanies.createTitle')} />
      <CompanyForm
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}
