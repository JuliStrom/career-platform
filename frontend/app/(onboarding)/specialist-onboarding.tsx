import { PathOnboardingScreen } from '@/features/auth/ui';
import { UserType } from '@/shared/model';

export default function SpecialistOnboardingRoute() {
  return <PathOnboardingScreen userType={UserType.SPECIALIST} />;
}
