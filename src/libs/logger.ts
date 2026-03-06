import { Logger, Transporter } from "@unipro-tech/node-logger";

const baseUrl =
  window.location.protocol +
  "//" +
  window.location.origin +
  ":" +
  window.location.port;
const logUrl = `${baseUrl}/api/log`;

export const baseLogger = new Logger(
  "UniQUE-Front", // ロガー名
  [
    Transporter.FileTransporter("./log.txt"),
    Transporter.PinoPrettyTransporter({ colorize: true }),
  ], // transportの配列
  {
    // pino.LoggerOptions のオプション(省略可)
    timestamp: () => `,"time":"${new Date().toUTCString()}"`,
    errorKey: "error",
    browser: {
      // see https://github.com/pinojs/pino/issues/1795
      write: () => {}, // ブラウザのコンソールにログを出力しないようにする
      // ブラウザやミドルウェアのログをサーバーに送信するための設定
      transmit: {
        send: (level, logEvent) => {
          // childを使用する場合にはlogEvent.messagesだけでなく、bindingsもサーバーに送信する必要がある
          const messages = logEvent.messages;
          // ミドルウェアではnavigator.sendBeaconは使用できないため、keepalive:true の fetch を使用
          // /api/logにリクエスト
          void fetch(logUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ level, messages }),
            keepalive: true,
          });
        },
      },
    },
  },
);
