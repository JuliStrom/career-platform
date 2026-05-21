import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { AuthFormValues, AuthMode } from '../model';
import {
  createLoginSchema,
  createRegisterBasicSchema,
  LoginFormData,
  RegisterBasicFormData,
} from '../model/schemas';

interface UseAuthFormOptions {
  mode: AuthMode;
}

interface UseAuthFormResult extends Pick<
  UseFormReturn<LoginFormData | RegisterBasicFormData>,
  'control' | 'formState' | 'handleSubmit' | 'reset'
> {
  isRegister: boolean;
  getSubmitPayload: (
    data: AuthFormValues
  ) => LoginFormData | RegisterBasicFormData;
  privacyAccepted: boolean;
  setPrivacyAccepted: (value: boolean) => void;
  pathname: string;
}

const defaultValues: AuthFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export function useAuthForm({ mode }: UseAuthFormOptions): UseAuthFormResult {
  const isRegister = mode === 'register';

  const schema = useMemo(
    () => (isRegister ? createRegisterBasicSchema() : createLoginSchema()),
    [isRegister]
  );

  const form = useForm<LoginFormData | RegisterBasicFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    form.reset(defaultValues);
    form.clearErrors();
    setPrivacyAccepted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const getSubmitPayload = (
    data: AuthFormValues
  ): LoginFormData | RegisterBasicFormData => {
    if (isRegister) {
      return {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
    }

    return {
      email: data.email,
      password: data.password,
    };
  };

  return {
    control: form.control,
    formState: form.formState,
    handleSubmit: form.handleSubmit,
    reset: form.reset,
    isRegister,
    getSubmitPayload,
    privacyAccepted,
    setPrivacyAccepted,
    pathname,
  };
}
