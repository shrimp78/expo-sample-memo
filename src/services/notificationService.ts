import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-modules-core';
import { Platform, AppState, AppStateStatus } from 'react-native';
import Constants from 'expo-constants';

/**
 * 通知の権限状態を確認する
 */
export type NotificationPermission = {
  status: Notifications.PermissionStatus; // 'granted' | 'denied' | 'undetermined'
  granted: boolean;
};

export async function getNotificationPermission(): Promise<NotificationPermission> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    return { status, granted };
  } catch (error) {
    console.error('Error checking notification permission: ', error);
    return { status: PermissionStatus.DENIED, granted: false };
  }
}

// TODO　: これはあとで削除する
export async function getNotificationPermissionStatus(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * 通知権限の状態を監視し、変更（アプリがアクティブになった際など）があった場合にコールバックを実行する
 */
export function subscribeToNotificationPermissionChange(onChange: (granted: boolean) => void) {
  const check = async () => {
    const granted = await getNotificationPermissionStatus();
    onChange(granted);
  };

  // 初回チェック
  void check();

  // アプリの状態変更を監視
  const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      void check();
    }
  });

  return subscription;
}

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
  // 備考：granted 以外の場合は、再度requestする。
  //      しかし denied の場合はOS側がダイアログを出さないという粋な仕様になっているらしい
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('通知権限を得られませんでした');
    return null;
  }

  // Expo Push Token を取得（APNSの代わりにExpoの配信基盤を使う）
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId
    })
  ).data;

  // Android用のチャネル設定
  // Android 8.0 以降では通知毎にチャネルを設定する必要がある
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    });
  }

  return token;
}
