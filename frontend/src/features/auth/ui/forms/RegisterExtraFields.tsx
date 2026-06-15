import { PasswordField } from '@/shared/ui';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface RegisterExtraFieldsProps {
  t: (key: string) => string;
  control: Control<any>;
  errors: FieldErrors<any>;
}

export function RegisterExtraFields({
  t,
  control,
  errors,
}: RegisterExtraFieldsProps) {
  const confirmPasswordError =
    typeof errors?.confirmPassword?.message === 'string'
      ? errors.confirmPassword.message
      : undefined;

  return (
    <Controller
      control={control}
      name="confirmPassword"
      render={({ field: { onChange, onBlur, value } }) => (
        <PasswordField
          value={value || ''}
          error={confirmPasswordError}
          onChangeText={onChange}
          onBlur={onBlur}
          nativeID="auth-confirm-password-label"
          label={t('register.confirmPassword')}
          margin="mb-6"
          placeholder={t('register.confirmPassword')}
        />
      )}
    />
  );
}
