import 'react-native-gesture-handler';
import React from 'react';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GroupProvider } from '@context/GroupContext';
import { ItemProvider } from '@context/ItemContext';
import { AuthProvider, useAuth } from '@context/AuthContext';

function GroupProviderGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <>{children}</>;
  return <GroupProvider>{children}</GroupProvider>;
}

function ItemProviderGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <>{children}</>;
  return <ItemProvider>{children}</ItemProvider>;
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config}>
        <AuthProvider>
          <GroupProviderGate>
            <ItemProviderGate>
              <Stack
                screenOptions={{
                  headerTintColor: '#000000',
                  headerStyle: { backgroundColor: '#F9F9F9' }
                }}
              >
                <Stack.Screen name="index" options={{ headerTitle: '' }} />

                {/* 認証 */}
                <Stack.Screen name="auth/signup" options={{ headerTitle: '' }} />

                {/* オンボーディング */}
                <Stack.Screen
                  name="onboarding/index"
                  options={{
                    headerTitle: '',
                    headerBackVisible: false
                  }}
                />

                {/* ホーム */}
                <Stack.Screen
                  name="home/index"
                  options={{
                    headerTitle: '',
                    headerBackVisible: false
                  }}
                />
                <Stack.Screen
                  name="home/settings"
                  options={{
                    headerTitle: '設定'
                  }}
                />

                {/* アイテム */}
                <Stack.Screen name="items/[id]" options={{ headerTitle: '' }} />

                {/* グループ */}
                <Stack.Screen name="groups/index" options={{ headerTitle: '' }} />
                <Stack.Screen name="groups/[id]" options={{ headerTitle: '' }} />

                {/* アカウント */}
                <Stack.Screen name="account/index" options={{ headerTitle: '' }} />
              </Stack>
            </ItemProviderGate>
          </GroupProviderGate>
        </AuthProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
