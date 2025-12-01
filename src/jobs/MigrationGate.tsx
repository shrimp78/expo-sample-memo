import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { runAnnivToBirthdayMigration } from '@jobs/migrations/annivToBirthday';

type Props = {
  children: React.ReactNode;
};

const MigrationGate: React.FC<Props> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isLoggedIn || !user) {
      setIsReady(true);
      return;
    }

    setIsReady(false);
    (async () => {
      try {
        await runAnnivToBirthdayMigration(user.id);
      } catch (error) {
        console.error('[MigrationGate] Failed to run anniv -> birthday migration', error);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, user?.id]);

  if (!isLoggedIn || isReady) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A5054" />
      <Text style={styles.message}>データを更新しています...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEFF4'
  },
  message: {
    marginTop: 12,
    color: '#4A5054',
    fontSize: 16
  }
});

export default MigrationGate;
