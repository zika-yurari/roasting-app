# 焙煎記録アプリ フロントエンド

## ファイル構成
```
src/
├── lib/
│   ├── config.js   ← ★ここに自分の値を書く
│   ├── auth.js     Cognito認証ヘルパー
│   └── api.js      APIクライアント（JWT自動付与）
├── hooks/
│   └── useAuth.js  認証状態の管理（Context）
├── pages/
│   ├── AuthPage.jsx         ログイン・新規登録・確認コード
│   ├── DashboardPage.jsx    焙煎記録一覧
│   ├── NewSessionPage.jsx   新規記録フォーム
│   └── SessionDetailPage.jsx 詳細＋温度カーブ＋評価
└── App.jsx  ルーティング設定
```

## セットアップ手順

### 1. src/lib/config.js を書き換える
```js
export const cognitoConfig = {
  UserPoolId: "ap-northeast-1_XXXXXXXXX",  // ← Cognitoのユーザープール ID
  ClientId:   "xxxxxxxxxxxxxxxxxxxx",       // ← アプリクライアント ID
  Region:     "ap-northeast-1",
};

export const apiConfig = {
  baseUrl: "https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v1",
  // ← sam deploy 後に表示された ApiEndpoint の値
};
```

### 2. 依存パッケージをインストール
```bash
npm install
```

### 3. 開発サーバーを起動
```bash
npm start
# ブラウザで http://localhost:3000 が開く
```

### 4. 動作確認
1. http://localhost:3000 にアクセス → ログイン画面が表示される
2. 「新規登録」でアカウントを作成
3. メールの確認コードを入力
4. ログインして焙煎記録を追加

## Amplifyへのデプロイ
```bash
# GitHubにpush
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/yourname/roasting-app.git
git push -u origin main

# AWSコンソール > Amplify > 新しいアプリ > GitHubを接続
```
