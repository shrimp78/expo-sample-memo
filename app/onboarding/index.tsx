import OnboardingScreen from '@screens/onboarding/OnboardingScreen';
import { useAuth } from '@context/AuthContext';

export default function OnboardingRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;
  return <OnboardingScreen />;
}
