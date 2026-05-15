// src/lib/auth.js
// Cognitoとの認証処理をまとめたヘルパー

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "./config";

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId:   cognitoConfig.ClientId,
});

// ── サインアップ ─────────────────────────────────────
export function signUp(email, password) {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
    ];
    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ── メール確認コード検証 ─────────────────────────────
export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ── サインイン ───────────────────────────────────────
export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const user    = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err)     => reject(err),
    });
  });
}

// ── サインアウト ─────────────────────────────────────
export function signOut() {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
}

// ── 現在のJWTトークンを取得（API呼び出しに使う） ────
export function getToken() {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) return reject(new Error("Not signed in"));
    user.getSession((err, session) => {
      if (err) reject(err);
      else resolve(session.getIdToken().getJwtToken());
    });
  });
}

// ── ログイン済みかチェック ───────────────────────────
export function getCurrentUser() {
  return userPool.getCurrentUser();
}
