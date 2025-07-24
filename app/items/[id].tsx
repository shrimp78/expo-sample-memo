import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import ItemEditScreen from '@screens/items/ItemEditScreen';

export default function ItemEditRoute() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  return <ItemEditScreen />;
}
