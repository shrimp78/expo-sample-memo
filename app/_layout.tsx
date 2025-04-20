import { config } from '@gluestack-ui/config'
import { GluestackUIProvider} from '@gluestack-ui/themed'
import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack screenOptions={{ headerTintColor: '#000000', headerStyle: { backgroundColor: '#F9F9F9' } }}>

        <Stack.Screen name="index" options={{ headerShown: false }} />

      </Stack>
    </GluestackUIProvider>
  )
}

