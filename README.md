# expo-sample-memo

Expo（`expo-router`）で作ったメモ/リマインダー系のサンプルアプリです。Firebase Authentication + Firestore をバックエンドに使い、Cloud Functions から Expo Push 通知を送信します。

## 主要機能

- Google / Apple サインイン（Firebase Auth）
- Firestore にユーザー/アイテム/グループを保存
- Expo Notifications（端末向け Push 通知）
- Cloud Functions（定期実行）で「通知予定のアイテム」を検索して Push 送信

## 技術スタック

- **App**: Expo SDK 52 / React Native 0.76 / React 18
- **Routing**: `expo-router`
- **UI**: Gluestack UI（`@gluestack-ui/*`）+ RNEUI（`@rneui/*`）
- **State**: Context + Zustand
- **Backend**: Firebase（Auth / Firestore）+ Cloud Functions

## ディレクトリ構成（抜粋）

- `app/`: 画面（`expo-router`）
  - `app/_layout.tsx`: Provider/Stack 定義
  - `app/index.tsx`: 起動時の遷移（ログイン/オンボーディング/ホーム）
- `src/context/`: Auth / Group / Item などの Context
- `src/services/`: Firestore/通知/キャッシュ等のサービス層
- `src/store/`: Zustand ストア
- `functions/`: Firebase Cloud Functions（TypeScript）
- `firestore.rules`, `firestore.indexes.json`: Firestore のルール/Index

## 必要要件

- **Node.js**: ルートのアプリは `>=18 <=24`（`package.json` の `engines`）
- **npm**: `package-lock.json` があるため npm 想定
- iOS/Android のネイティブ実行をする場合は Xcode / Android Studio
- Push 通知の動作確認は **実機推奨**（シミュレーターでは制限あり）

## セットアップ（アプリ）

```bash
npm install
```

起動:

```bash
npm run start
```

プラットフォーム別:

```bash
npm run ios
npm run android
npm run web
```

Lint:

```bash
npm run lint
```

## 環境変数 / 設定ファイル

このプロジェクトは `app.config.js` が環境に応じて `.env` と Firebase 設定（iOSの plist）を読み込み、Expo の `extra` に注入します。

### APP_VARIANT（開発/本番の切替）

- `APP_VARIANT=production` のとき `.env.production` を読み込み
- それ以外（`development` / `preview` など）は `.env.development` を読み込み（デフォルト）

例:

```bash
APP_VARIANT=development npm run start
APP_VARIANT=production npm run start
```

### .env（リポジトリに含まれる）

`.env.development` / `.env.production` には、主に Google 認証用の Web Client ID が入ります。

- `FIREBASE_WEB_CLIENT_ID`

### Firebase 設定（機密 / リポジトリに含めない）

`.gitignore` で以下が除外されています（機密情報を含むためコミットしません）。

- `GoogleService-Info.dev.plist`（開発）
- `GoogleService-Info.plist`（本番）
- `google-services.json`

`app.config.js` は以下の優先順で iOS plist を探します。

- EAS Secrets（環境変数）: `GOOGLE_SERVICE_INFO_PLIST_DEV` / `GOOGLE_SERVICE_INFO_PLIST`
- ローカルファイル: `GoogleService-Info.dev.plist` / `GoogleService-Info.plist`

加えて、ビルド番号を環境変数で上書きできます。

- `IOS_BUILD_NUMBER`（例: `1`）
- `ANDROID_VERSION_CODE`（例: `1`）

## EAS Build（任意）

`eas.json` に以下のプロファイルが定義されています。

- `development` / `development-simulator`: Dev Client（内部配布）
- `preview`: 内部配布（`APP_VARIANT=preview`）
- `production`: Store 配布（`APP_VARIANT=production`）

例:

```bash
npx eas build -p ios --profile development-simulator
npx eas build -p android --profile development
```

## Firebase（Firestore / Functions）

### Firestore ルール / Index

- ルール: `firestore.rules`
- Index: `firestore.indexes.json`
  - Functions が `collectionGroup('items')` で `notifyEnabled` と `nextNotifyAt` を使ってクエリするため、該当 Index が必要です。

### Functions（ローカル）

依存関係のインストール:

```bash
cd functions
npm install
```

エミュレーター起動（Functionsのみ）:

```bash
npm run serve
```

デプロイ:

```bash
npm run deploy
```

補足:

- `functions/src/index.ts` に、定期実行（毎時0分）の通知バッチ `sendScheduledNotifications` と、手動実行用の HTTP 関数 `testNotificationBatch` があります。
- `.firebaserc` に `default`（本番）と `development`（開発）プロジェクトが定義されています。`firebase` CLI 側で利用プロジェクトを切り替えてください。

## よくあるハマりどころ

- **Google Sign-In が動かない**: `FIREBASE_WEB_CLIENT_ID` が未設定、もしくは iOS/Android の設定（plist/json）が不足している可能性があります。
- **Push 通知が来ない**: シミュレーターでは動作しない/制限があります。実機で通知権限を許可し、Expo Push Token が取得できているか確認してください。
- **Firestore クエリが落ちる**: `firestore.indexes.json` の Index が未適用の可能性があります（特に collection group の複合条件）。

