import fs from "fs";
import path from "path";
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

// 秘密鍵をファイルから読み込む
// 存在しない場合は新規作成
const secretKeyFile =
  process.env.CSRF_SECRET_KEY_PATH || `${__dirname}/../../keys/csrf_secret.key`;
const publicKeyFile =
  process.env.CSRF_PUBLIC_KEY_PATH || `${__dirname}/../../keys/csrf_public.key`;
let secretKey, publicKey;

if (fs.existsSync(secretKeyFile) && fs.existsSync(publicKeyFile)) {
  secretKey = util.decodeBase64(fs.readFileSync(secretKeyFile, "utf8"));
  publicKey = secretKey.slice(32); // tweetnaclの秘密鍵は32+32=64バイト
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

export const GenerateCSRFToken = (data: string): string => {
  const message = util.decodeUTF8(data);
  const signedMessage = nacl.sign(message, secretKey);
  return util.encodeBase64(signedMessage);
};

export const VerifyCSRFToken = (token: string): string | null => {
  try {
    const verified = nacl.sign.open(util.decodeBase64(token), publicKey);
    if (verified) {
      return util.encodeUTF8(verified);
    } else {
      return null;
    }
  } catch (e) {
    //TODO: エラーログを記録
    return null;
  }
};
