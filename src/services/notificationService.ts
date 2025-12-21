import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * 通知の権限をリクエスト、成功した場合はExpo Push Token を返却
 */
export async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) {
    console.log('🚫通知はシミュレーターでは動作しません');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
}
