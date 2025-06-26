import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config}>
        <Stack
          screenOptions={{
            headerTintColor: '#000000',
            headerStyle: { backgroundColor: '#F9F9F9' }
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* ホーム */}
          <Stack.Screen name="home/index" options={{ headerTitle: '' }} />

          {/* アイテム */}
          <Stack.Screen name="items/[id]" options={{ headerTitle: '' }} />

          {/* グループ */}
          <Stack.Screen name="groups/index" options={{ headerTitle: 'グループの編集' }} />
        </Stack>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
