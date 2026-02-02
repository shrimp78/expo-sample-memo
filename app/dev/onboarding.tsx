import OnboardingScreen from '@screens/onboarding/OnboardingScreen';
import { useAuth } from '@context/AuthContext';
import { router } from 'expo-router';

export default function DevOnboardingRoute() {
  const { isLoggedIn } = useAuth();

  // 本番環境ではアクセス不可（開発専用）
  if (!__DEV__) {
    router.replace('/');
    return null;
  }

  if (!isLoggedIn) return null;

  return <OnboardingScreen previewMode />;
}
