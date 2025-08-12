import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import AccountIndexScreen from '@screens/account/AccountIndexScreen';

export default function AccountRoute() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  return <AccountIndexScreen />;
}
