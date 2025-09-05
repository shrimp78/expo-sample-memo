import HomeIndexScreen from '@screens/home/HomeIndexScreen';
import { useAuth } from '@context/AuthContext';

export default function HomeRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;
  return <HomeIndexScreen />;
}
