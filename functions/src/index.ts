import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Firebase Admin SDKを初期化
admin.initializeApp();

/**
 * 通知タイミングから次回通知予定日時を計算（毎年繰り返し）
 * @param {admin.firestore.Timestamp} birthday 誕生日
 * @param {string} notifyTiming 通知タイミング
 * @return {admin.firestore.Timestamp | null} 次回通知予定日時
 */
function calculateNextNotifyAt(
  birthday: admin.firestore.Timestamp,
  notifyTiming: string
): admin.firestore.Timestamp | null {
  const birthdayDate = birthday.toDate();
  const now = new Date();

  // 今年の誕生日（午前9時）を取得
  const nextBirthday = new Date(
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
 * @param {string} expoPushToken Expo Push Token
 * @param {string} title 通知タイトル
 * @param {string} body 通知本文
 * @param {any} data 追加データ
 * @return {Promise<void>}
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send push notification: ${response.statusText} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Push notification response:', responseData);
}

/**
 * 毎時間実行される通知バッチ処理
 * スケジュール: 毎時0分に実行
 */
export const sendScheduledNotifications = functions
  .region('asia-northeast1') // 東京リージョン
  .runWith({
    timeoutSeconds: 540, // 9分（最大実行時間）
    memory: '256MB' // メモリ割り当て
  })
  .pubsub.schedule('0 * * * *') // 毎時0分に実行（Cron形式）
  .timeZone('Asia/Tokyo') // 日本時間
  .onRun(async context => {
    console.log('=== Starting scheduled notification batch ===');
    console.log('Execution time:', new Date().toISOString());

    const now = new Date();
    const db = admin.firestore();

    try {
      // 全ユーザーを取得
      const usersSnapshot = await db.collection('users').get();
      console.log(`Total users: ${usersSnapshot.size}`);

      let totalNotificationsSent = 0;
      let totalErrors = 0;

      // 各ユーザーごとに通知対象のItemをチェック
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const expoPushToken = userData.expoPushToken;

        if (!expoPushToken) {
          console.log(`User ${userId}: No push token, skipping...`);
          continue;
        }

        console.log(`User ${userId}: Checking for notifications...`);

        try {
          // 通知対象のItemを取得
          const itemsRef = db.collection('users').doc(userId).collection('items');
          const notifyQuery = itemsRef
            .where('notifyEnabled', '==', true)
            .where('nextNotifyAt', '<=', admin.firestore.Timestamp.fromDate(now));

          const itemsSnapshot = await notifyQuery.get();
          console.log(`User ${userId}: Found ${itemsSnapshot.size} items to notify`);

          // 各Itemに対して通知を送信
          for (const itemDoc of itemsSnapshot.docs) {
            const itemId = itemDoc.id;
            const itemData = itemDoc.data();

            try {
              console.log(`Processing item ${itemId}: ${itemData.title}`);

              // プッシュ通知を送信
              await sendPushNotification(
                expoPushToken,
                `${itemData.title} のリマインダー`,
                `もうすぐ ${itemData.title} の日です！`,
                {
                  itemId,
                  userId,
                  type: 'birthday_reminder'
                }
              );

              console.log(`✓ Notification sent for item ${itemId}`);

              // 次回通知日時を来年に更新
              const birthday = itemData.birthday as admin.firestore.Timestamp;
              const notifyTiming = itemData.notifyTiming as string;

              const nextNotifyAt = calculateNextNotifyAt(birthday, notifyTiming);

              if (nextNotifyAt) {
                await itemDoc.ref.update({
                  nextNotifyAt,
                  lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log(
                  `✓ Updated nextNotifyAt for item ${itemId} to ${nextNotifyAt.toDate().toISOString()}`
                );
                totalNotificationsSent++;
              } else {
                console.error(`✗ Failed to calculate next notify date for item ${itemId}`);
                totalErrors++;
              }
            } catch (itemError) {
              console.error(`✗ Error processing item ${itemId}:`, itemError);
              totalErrors++;
              // 個別のエラーは記録して続行
            }
          }
        } catch (userError) {
          console.error(`✗ Error processing user ${userId}:`, userError);
          totalErrors++;
          // ユーザー単位のエラーは記録して続行
        }
      }

      console.log('=== Batch completed ===');
      console.log(`Total notifications sent: ${totalNotificationsSent}`);
      console.log(`Total errors: ${totalErrors}`);

      return {
        success: true,
        notificationsSent: totalNotificationsSent,
        errors: totalErrors
      };
    } catch (error) {
      console.error('=== Fatal error in scheduled notification batch ===', error);
      throw error;
    }
  });

/**
 * テスト用: 手動で通知バッチを実行できる関数
 * HTTPリクエストで呼び出し可能
 */
export const testNotificationBatch = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    console.log('Manual test notification batch triggered');

    try {
      // sendScheduledNotifications と同じ処理を実行
      // .run() は (data, context) の2つの引数を必要とします
      const result = await sendScheduledNotifications.run({} as any, {} as any);

      res.status(200).json({
        success: true,
        message: 'Test batch completed',
        result
      });
    } catch (error) {
      console.error('Error in test batch:', error);
      res.status(500).json({
        success: false,
        error: String(error)
      });
    }
  });
