# iOS（App Store）申請手順（Expo + EAS / このリポジトリ用）

このドキュメントは、このプロジェクト（Expo + EAS）を **App Store Connect にアップロード → TestFlight確認 → App Review提出** まで進めるための手順書です。

前提（完了済みのため割愛）:
- Apple Developer Program への加入
- App Store Connect 側での Bundle ID 作成
- EAS プロジェクト作成（`extra.eas.projectId` が設定済み）

---

## 1. 申請前に確認・調整する設定（このリポジトリの編集箇所）

### 1.1 Bundle Identifier（最重要）
- **編集ファイル**: `app.config.js`
- **該当キー**: `expo.ios.bundleIdentifier`

このリポジトリでは以下に設定されています。
- **production**: `com.shrimp78.spdapp`
- **development**: `com.shrimp78.spdapp.dev`

注意:
- iOS の Bundle Identifier は **英数字 + ドットのみ**です（ハイフン `-` は不可）。
- App Store Connect で作成済みの Bundle ID と **完全一致**させてください（異なる場合は `app.config.js` 側を合わせます）。

---

## 2. version / buildNumber 設計（どのファイルを変える？）

### 2.1 ユーザーに見えるバージョン（例: 1.0.0）
- **編集ファイル**: `app.config.js`
- **該当キー**: `expo.version`

リリースごとに `1.0.0` → `1.0.1` → `1.1.0` のように更新します。

> 補足: `package.json` の `"version"` は npm 用で、iOSの提出バージョンとは別物として扱うのが安全です（混同しない）。

### 2.2 Apple に提出するビルド番号（buildNumber）
提出のたびに **必ず増やす必要**があります（同じ buildNumber の再提出は不可）。

このリポジトリの方針:
- **編集ファイル**:
  - `app.config.js` の `expo.ios.buildNumber` に初期値（例: `"1"`）を置く
  - `eas.json` の `build.production.autoIncrement: true` で **提出用ビルドを自動インクリメント**する

手動で管理したい場合は:
- `app.config.js` の `expo.ios.buildNumber` を `"1"` → `"2"` → `"3"` と増やします（ただし自動インクリメントと二重管理しない）

---

## 3. 通知（expo-notifications）: 権限文言の例と、どのファイルを編集するか

### 3.1 iOSの通知許可は「Info.plistの権限文言」ではない
カメラや写真のように `NSCameraUsageDescription` 等を Info.plist に書くタイプと違い、**通知許可は通常 Info.plist の “UsageDescription 文字列” を追加しません**。

その代わりに重要なのは:
- **許可ダイアログを出す前に**、アプリ内で「なぜ通知が必要か」を説明する（いわゆる “プレパーミッション”）
- 設定画面などから再誘導できるようにする

### 3.2 このリポジトリで「通知許可リクエスト」をしている場所
- `src/components/screens/home/SettingsScreen.tsx`
  - `Notifications.requestPermissionsAsync()` を呼んでいます
- `src/services/notificationService.ts`
  - `getPermissionsAsync()` / `requestPermissionsAsync()` を呼んでいます

つまり **権限取得の直前に表示する説明文**（UI文言）を入れるなら:
- 設定画面で許可を押す導線に説明を足す → `SettingsScreen.tsx`
- サービス層で許可を要求する前にUIを出したい → 呼び出し元（画面/モーダル）側に説明を足す（サービスだけではUIを出せないため）

### 3.3 権限文言（プレパーミッション）例
以下は日本語文言例です（アプリの実態に合わせて調整してください）。

**例1（誕生日/記念日のリマインド）**
- タイトル: 「通知を許可してください」
- 本文: 「誕生日や記念日が近づいたら、リマインド通知でお知らせします。通知はいつでも設定から変更できます。」
- ボタン:
  - 「許可する」
  - 「今はしない」

**例2（最小限の説明）**
- 本文: 「大切な予定を忘れないために通知を利用します。」

---

## 4. EAS（ビルド/提出）手順

### 4.1 事前に確認するファイル

#### `eas.json`
このリポジトリでは以下を想定しています:
- `cli.appVersionSource`: `local`（`app.config.js` の version を参照）
- `build.production.distribution`: `store`（App Store 提出用）
- `build.production.autoIncrement`: `true`（buildNumber 自動インクリメント）

### 4.2 App Store 提出用ビルド（.ipa）を作る
```bash
eas build -p ios --profile production
```

初回は証明書/Provisioningの作成を聞かれます。基本は **EASに自動作成を任せる**でOKです。

### 4.3 App Store Connect へアップロード（EAS Submit）
```bash
eas submit -p ios --profile production
```

成功すると App Store Connect の TestFlight / ビルドに反映されます。

---

## 5. App Store Connect（提出に必要な入力）

### 5.1 スクリーンショット/説明/URL
最低限:
- スクリーンショット（端末サイズ要件に注意）
- 説明文、キーワード
- サポートURL
- プライバシーポリシーURL

### 5.2 App Privacy（データ収集の申告）
このアプリは **広告なし / 課金なし**ですが、Firebase 等の利用状況に応じて
「収集するデータ」「用途（分析、アプリ機能 等）」を正確に申告してください。

### 5.3 ログインが必要な場合の審査用アカウント
審査担当がログインできないとリジェクトされます。
- 審査用アカウント（ID/パスワード）
- ログイン手順（2FAがある場合の注意点も）
を「App Review 情報」に記載します。

---

## 6. Googleログイン / Appleログインについて（このアプリの前提）
- このアプリは **GoogleログインとAppleログイン**があるため、Appleのガイドライン観点でも **Sign in with Apple が用意されている状態**で問題ありません。
- `app.config.js` では `ios.usesAppleSignIn: true` および `expo-apple-authentication` プラグインが設定済みです。

---

## 7. リリース運用の最小ルール（おすすめ）
- **審査に出すたび**に:
  - `app.config.js` の `expo.version` を必要に応じて更新
  - `eas build -p ios --profile production`（buildNumber は `autoIncrement` に任せる）
  - `eas submit -p ios --profile production`

