import { PathOnboardingScreen } from '@/features/auth/ui';
import { UserType } from '@/shared/model';

export default function EmployerOnboardingRoute() {
  return <PathOnboardingScreen userType={UserType.EMPLOYER} />;
}
