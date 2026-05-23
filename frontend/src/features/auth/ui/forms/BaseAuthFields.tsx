import { NamedField, PasswordField } from '@/shared/ui';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface BaseAuthFieldsProps {
  t: (key: string) => string;
  control: Control<any>;
  errors: FieldErrors<any>;
}

export function BaseAuthFields({ t, control, errors }: BaseAuthFieldsProps) {
  const emailError =
    typeof errors?.email?.message === 'string'
      ? errors.email.message
      : undefined;
  const passwordError =
    typeof errors?.password?.message === 'string'
      ? errors.password.message
      : undefined;

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { isTouched },
        }) => (
          <NamedField
            value={value}
            error={emailError}
            touched={isTouched}
            onChangeText={onChange}
            onBlur={onBlur}
            nativeID="auth-email-label"
            label={t('login.email')}
            placeholder={t('login.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            value={value}
            error={passwordError}
            onChangeText={onChange}
            onBlur={onBlur}
            nativeID="auth-password-label"
            label={t('login.password')}
            placeholder={t('login.password')}
          />
        )}
      />
    </>
  );
}
