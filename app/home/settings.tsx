import { Redirect } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import SettingsScreen from '@screens/home/SettingsScreen';

export default function HomeSettingsRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  return <SettingsScreen />;
}
