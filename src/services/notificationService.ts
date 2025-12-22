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

  // 現在のOSの通知設定がどのようになっているかを取得する
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 権限がまだない場合は要求可否も含めてOSにRequestする
  // - granted: 許可
  // - denied: 拒否された
  // - undetermined: まだ1度もユーザーに要求していない状態(初回インストール時など)
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('通知権限を得られませんでした');
    return null;
  }
}
