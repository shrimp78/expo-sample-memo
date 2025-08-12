import HomeIndexScreen from '@screens/home/HomeIndexScreen';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import { useEffect } from 'react';

export default function HomeRoute() {
  const { isLoggedIn } = useAuth();

  // 認証状態チェック
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  return <HomeIndexScreen />;
}
