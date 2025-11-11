const settings = {
  host: process.env.MAIL_HOST || "unipro.sakura.ne.jp",
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
  secure: process.env.MAIL_SECURE === "true" || true,
  auth: {
    user: process.env.MAIL_USER as string,
    pass: process.env.MAIL_PASS as string,
  },
  fromEmail: process.env.MAIL_FROM_EMAIL as string,
  fromName: process.env.MAIL_FROM_NAME || "UniQUE",
  envelopeFrom: (process.env.MAIL_ENVELOPE_FROM ||
    process.env.MAIL_FROM_EMAIL) as string,
};
export default settings;
