import { Redirect } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import AccountIndexScreen from '@screens/account/AccountIndexScreen';

export default function AccountRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  return <AccountIndexScreen />;
}
