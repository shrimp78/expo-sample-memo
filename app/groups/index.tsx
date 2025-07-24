import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import GroupIndexScreen from '@screens/groups/GroupIndexScreen';

export default function GroupsRoute() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  return <GroupIndexScreen />;
}
