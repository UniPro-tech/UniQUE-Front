import fs from "fs";
import { cookies } from "next/headers";
import path from "path";
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

// 秘密鍵をファイルから読み込む
// 存在しない場合は新規作成
const secretKeyFile =
  process.env.SESSION_SECRET_KEY_PATH ||
  path.join(process.cwd(), "keys", "session_secret.key");
const publicKeyFile =
  process.env.SESSION_PUBLIC_KEY_PATH ||
  path.join(process.cwd(), "keys", "session_public.key");
let secretKey, publicKey;

if (fs.existsSync(secretKeyFile) && fs.existsSync(publicKeyFile)) {
  secretKey = util.decodeBase64(fs.readFileSync(secretKeyFile, "utf8"));
  publicKey = util.decodeBase64(fs.readFileSync(publicKeyFile, "utf8"));
} else {
  if (!fs.existsSync(path.dirname(secretKeyFile))) {
    fs.mkdirSync(path.dirname(secretKeyFile), { recursive: true });
  }
  const keyPair = nacl.sign.keyPair();
  secretKey = keyPair.secretKey;
  publicKey = keyPair.publicKey;
  fs.writeFileSync(publicKeyFile, util.encodeBase64(publicKey), {
    mode: 0o600,
  });
  fs.writeFileSync(secretKeyFile, util.encodeBase64(secretKey), {
    mode: 0o600,
  });
}

export const createSession = async (sessionId: string, expires: Date) => {
  const res = (await cookies()).set("sid", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
  return res;
};
