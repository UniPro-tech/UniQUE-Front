// サニタイズ用ヘルパー: ログ注入を防ぎ、長すぎる値や制御文字を削る
export function sanitizeForLog(input: unknown, maxLen = 1000): string {
  try {
    let s: string;
    if (typeof input === "string") s = input;
    else if (input instanceof Error) s = input.message || String(input);
    else {
      try {
        s = JSON.stringify(input);
      } catch {
        s = String(input);
      }
    }

    if (s === undefined || s === null) s = String(input);

    // 制御文字を可視化表現に置換（改行やCRでログ改竄されるのを防ぐ）
    s = s.replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) => {
      const code = c.charCodeAt(0).toString(16).padStart(2, "0");
      return `<0x${code}>`;
    });

    if (s.length > maxLen) return s.slice(0, maxLen) + "...";
    return s;
  } catch {
    try {
      return String(input).slice(0, maxLen);
    } catch {
      return "[unserializable]";
    }
  }
}
