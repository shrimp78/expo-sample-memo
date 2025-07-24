import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import GroupEditScreen from '@screens/groups/GroupEditScreen';

export default function GroupEditRoute() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  return <GroupEditScreen />;
}
