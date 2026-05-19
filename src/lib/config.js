// ================================================================
// src/lib/config.js
// ここの値を自分の環境に書き換えてください
// ================================================================

export const cognitoConfig = {
  UserPoolId: "ap-northeast-1_XXXXXXXXX",       // ← CognitoのユーザープールID
  ClientId:   "1234567890abcdefghijklmnop",      // ← アプリクライアントID
  Region:     "ap-northeast-1",
};

export const apiConfig = {
  baseUrl: "https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v1",
  // SAM deploy後にOutputsに表示されたApiEndpointの値
};
