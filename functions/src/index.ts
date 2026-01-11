import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Admin SDKを初期化
admin.initializeApp();

/**
 * 通知タイミングから次回通知予定日時を計算（毎年繰り返し）
 */
function calculateNextNotifyAt(
  birthday: admin.firestore.Timestamp,
  notifyTiming: string
): admin.firestore.Timestamp | null {
  const birthdayDate = birthday.toDate();
  const now = new Date();

  // 今年の誕生日（午前9時）を取得
  let nextBirthday = new Date(
    now.getFullYear(),
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
    9,
    0,
    0,
    0
  );

  // 通知タイミングを引いた日時
  const notifyDate = new Date(nextBirthday);
  switch (notifyTiming) {
    case '1h':
      notifyDate.setHours(notifyDate.getHours() - 1);
      break;
    case '24h':
      notifyDate.setDate(notifyDate.getDate() - 1);
      break;
    case '7d':
      notifyDate.setDate(notifyDate.getDate() - 7);
      break;
    case '14d':
      notifyDate.setDate(notifyDate.getDate() - 14);
      break;
    case '30d':
      notifyDate.setDate(notifyDate.getDate() - 30);
      break;
    default:
      return null;
  }

  // 通知日時が既に過ぎていたら、来年の日時を計算
  if (notifyDate <= now) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    notifyDate.setFullYear(notifyDate.getFullYear() + 1);
  }

  return admin.firestore.Timestamp.fromDate(notifyDate);
}

/**
 * Expo Push通知を送信
 */
async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<void> {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send push notification: ${response.statusText} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Push notification response:', responseData);
}