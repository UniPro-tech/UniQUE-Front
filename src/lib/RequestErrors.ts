export const BadRequestError = new Error(
  "リクエストが不正です。入力内容を確認してください。",
  { cause: "Bad Request" }
);
export const AuthenticationError = new Error(
  "認証に失敗しました。認証情報を確認してください。",
  {
    cause: "Password or username is incorrect",
  }
);
export const AuthorizeError = new Error(
  "認可に失敗しました。認証情報を確認してください。",
  {
    cause: "Forbidden",
  }
);
export const ServerError = new Error(
  "サーバーエラーが発生しました。時間をおいて再度お試しください。",
  { cause: "Internal server error" }
);
export const CSRFError = new Error(
  "不正なリクエストです。リロードしてください。",
  { cause: "CSRF token verification failed" }
);
