# Firebase Cloud Functions セットアップガイド

## 📚 目次
1. [事前準備](#事前準備)
2. [Firebase CLIのインストール](#firebase-cliのインストール)
3. [Cloud Functionsの初期化](#cloud-functionsの初期化)
4. [通知バッチ処理の実装](#通知バッチ処理の実装)
5. [デプロイとテスト](#デプロイとテスト)
6. [トラブルシューティング](#トラブルシューティング)

---

## 🔧 事前準備

### 必要なもの
- Node.js v18以上がインストールされていること
- Firebase プロジェクト（既に作成済み）
- Firebase CLI がインストールされていること

### 確認コマンド
```bash
# Node.jsのバージョン確認
node --version  # v18.0.0以上であることを確認

# npm のバージョン確認
npm --version
```

---

## 📦 Firebase CLIのインストール

### ステップ1: Firebase CLIをインストール

```bash
# npmを使ってグローバルにインストール
npm install -g firebase-tools

# インストール確認
firebase --version
```

### ステップ2: Firebaseにログイン

```bash
# Firebaseアカウントにログイン（ブラウザが開きます）
firebase login

# ログイン確認
firebase projects:list
```

表示されたプロジェクト一覧の中に、あなたのプロジェクトがあることを確認してください。

---

## 🚀 Cloud Functionsの初期化

### ステップ1: プロジェクトディレクトリに移動

```bash
cd /Users/username/.cursor/worktrees/expo-sample-memo/viy
```

### ステップ2: Firebase プロジェクトの初期化

```bash
# Firebaseプロジェクトを初期化（既に設定済みの場合はスキップ）
firebase init
```

以下の質問が表示されます：

```
? Which Firebase features do you want to set up for this directory?
```

**矢印キーで選択し、スペースキーでチェックを入れます：**
- [x] Functions: Configure a Cloud Functions directory and its files

Enter キーを押して次へ。

```
? Please select an option:
```

- **Use an existing project** を選択（既存のFirebaseプロジェクトを使用）

```
? Select a default Firebase project for this directory:
```

- あなたのプロジェクト名を選択（例: `spd-app` など）

```
? What language would you like to use to write Cloud Functions?
```

- **TypeScript** を選択（推奨）

```
? Do you want to use ESLint to catch probable bugs and enforce style?
```

- **Yes** を選択

```
? Do you want to install dependencies with npm now?
```

- **Yes** を選択

### ステップ3: 初期化完了の確認

初期化が完了すると、以下のディレクトリ構造が作成されます：

```
viy/
├── functions/
│   ├── src/
│   │   └── index.ts       # Cloud Functions のメインファイル
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.js
├── firebase.json
└── .firebaserc
```

---

## 💻 通知バッチ処理の実装

### ステップ1: functionsディレクトリに移動

```bash
cd functions
```

### ステップ2: 必要なパッケージをインストール

```bash
# Firebase Admin SDKは既にインストール済みのはず
# 念のため確認
npm list firebase-admin firebase-functions

# もしインストールされていなければ
npm install firebase-admin firebase-functions
```

### ステップ3: Cloud Functionsのコードを実装

`functions/src/index.ts` を以下の内容で編集してください：

```typescript
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
    9, 0, 0, 0
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

/**
 * 毎時間実行される通知バッチ処理
 * スケジュール: 毎時0分に実行
 */
export const sendScheduledNotifications = functions
  .region('asia-northeast1')  // 東京リージョン
  .runWith({
    timeoutSeconds: 540,  // 9分（最大実行時間）
    memory: '256MB'       // メモリ割り当て
  })
  .pubsub.schedule('0 * * * *')  // 毎時0分に実行（Cron形式）
  .timeZone('Asia/Tokyo')        // 日本時間
  .onRun(async (context) => {
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

                console.log(`✓ Updated nextNotifyAt for item ${itemId} to ${nextNotifyAt.toDate().toISOString()}`);
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
      const result = await sendScheduledNotifications.run({} as any);

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
```

### ステップ4: TypeScriptのビルド確認

```bash
# functionsディレクトリで実行
npm run build

# エラーがなければ成功
```

---

## 🚢 デプロイとテスト

### ステップ1: Firebaseプロジェクトのアップグレード（必要な場合）

Cloud Functionsを使用するには、Firebaseプロジェクトを**Blazeプラン（従量課金）**にアップグレードする必要があります。

#### Firebaseコンソールでの操作:

1. **Firebaseコンソールにアクセス**: https://console.firebase.google.com/
2. あなたのプロジェクトを選択
3. 左下の「⚙️ 設定」→「使用状況と請求」をクリック
4. 「プランを変更」をクリック
5. 「Blaze プラン」を選択
6. クレジットカード情報を登録

**💰 料金について:**
- Cloud Functionsには無料枠があります
- 月間の無料枠:
  - 呼び出し回数: 200万回
  - GB秒: 40万GB秒
  - アウトバウンドネットワーク: 5GB
- 通常の使用では無料枠内で収まることが多いです

### ステップ2: Cloud Functionsをデプロイ

```bash
# プロジェクトのルートディレクトリに戻る
cd /Users/username/.cursor/worktrees/expo-sample-memo/viy

# Cloud Functionsをデプロイ
firebase deploy --only functions

# 特定の関数のみデプロイする場合
firebase deploy --only functions:sendScheduledNotifications
```

デプロイが成功すると、以下のような出力が表示されます：

```
✔  functions[asia-northeast1-sendScheduledNotifications] Successful create operation.
Function URL (sendScheduledNotifications): https://asia-northeast1-YOUR_PROJECT.cloudfunctions.net/sendScheduledNotifications

✔  Deploy complete!
```

### ステップ3: Firestoreインデックスの作成

バッチ処理で効率的にクエリするため、Firestoreインデックスを作成します。

#### 方法1: 自動作成（推奨）

1. Cloud Functionsを一度実行すると、エラーメッセージにインデックス作成のリンクが表示されます
2. そのリンクをクリックして自動作成

#### 方法2: 手動作成

1. **Firebaseコンソール**にアクセス
2. 左メニューから「Firestore Database」を選択
3. 上部タブの「インデックス」をクリック
4. 「複合」タブを選択
5. 「インデックスを作成」ボタンをクリック
6. 以下の情報を入力：
   - **コレクションID**: `items`（サブコレクション）
   - **範囲を指定**: ON
   - フィールド1:
     - **フィールドパス**: `notifyEnabled`
     - **順序**: 昇順
   - フィールド2:
     - **フィールドパス**: `nextNotifyAt`
     - **順序**: 昇順
   - **クエリ スコープ**: コレクショングループ
7. 「作成」ボタンをクリック

インデックスの作成には数分かかります。

### ステップ4: テスト実行

#### 方法1: 手動テスト関数を使用

```bash
# テスト用のHTTP関数を呼び出し
curl https://asia-northeast1-YOUR_PROJECT.cloudfunctions.net/testNotificationBatch
```

#### 方法2: Firebaseコンソールから確認

1. Firebaseコンソール → 左メニュー「Functions」
2. デプロイした関数が表示されます
3. `sendScheduledNotifications` の「ログ」タブをクリック
4. 次回の実行時刻まで待つ（毎時0分）

#### 方法3: ローカルエミュレータでテスト

```bash
# Firebase Emulatorをインストール（初回のみ）
firebase init emulators

# エミュレータを起動
firebase emulators:start

# 別のターミナルで関数を手動トリガー
firebase functions:shell
> sendScheduledNotifications()
```

### ステップ5: ログの確認

#### Firebaseコンソールでログを確認:

1. Firebaseコンソール → 「Functions」
2. `sendScheduledNotifications` をクリック
3. 「ログ」タブで実行ログを確認

#### Cloud Loggingで詳細ログを確認:

1. Google Cloud Console: https://console.cloud.google.com/
2. プロジェクトを選択
3. 左メニュー → 「Logging」→「ログ エクスプローラ」
4. フィルタ: `resource.type="cloud_function"`

---

## 🐛 トラブルシューティング

### エラー1: `Permission denied`

**原因**: Firebase CLIがログインしていない

**解決方法**:
```bash
firebase login
firebase projects:list
```

### エラー2: `Billing account not configured`

**原因**: プロジェクトがBlazeプランになっていない

**解決方法**:
上記「ステップ1: Firebaseプロジェクトのアップグレード」を参照

### エラー3: `Index not found`

**原因**: Firestoreインデックスが作成されていない

**解決方法**:
1. エラーメッセージのリンクをクリック
2. または上記「ステップ3: Firestoreインデックスの作成」を参照

### エラー4: 通知が送信されない

**確認事項**:
1. ユーザーの`expoPushToken`が正しく保存されているか確認
2. Itemの`notifyEnabled`が`true`になっているか確認
3. `nextNotifyAt`が現在時刻より前になっているか確認

**デバッグ方法**:
```bash
# Firebaseコンソールでログを確認
# または
firebase functions:log --only sendScheduledNotifications
```

### エラー5: 関数がタイムアウトする

**原因**: ユーザーやItemが多すぎて処理時間が9分を超えた

**解決方法**:
```typescript
// functions/src/index.ts の runWith 設定を変更
.runWith({
  timeoutSeconds: 540,  // 最大9分
  memory: '512MB'       // メモリを増やす
})
```

---

## 📊 動作確認チェックリスト

- [ ] Firebase CLIがインストールされている
- [ ] Firebaseプロジェクトが Blazeプランになっている
- [ ] Cloud Functionsがデプロイされている
- [ ] Firestoreインデックスが作成されている
- [ ] テスト用のItemが作成されている（notifyEnabled=true）
- [ ] テスト用Itemの nextNotifyAt が現在時刻より前に設定されている
- [ ] ログに実行履歴が表示されている
- [ ] 実際に通知が届く

---

## 🎯 次のステップ

1. **通知内容のカスタマイズ**: 通知メッセージをより詳細にする
2. **エラーハンドリングの強化**: 失敗した通知を再試行する仕組み
3. **通知履歴の記録**: 別コレクションに通知履歴を保存
4. **ユーザー設定の追加**: 通知時刻をユーザーごとにカスタマイズ可能に
5. **モニタリング**: Cloud Monitoringでアラートを設定

---

## 📚 参考リンク

- [Firebase Cloud Functions 公式ドキュメント](https://firebase.google.com/docs/functions)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Cron式のジェネレーター](https://crontab.guru/)
- [Firebase料金プラン](https://firebase.google.com/pricing)

---
