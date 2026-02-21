export const ParseJwt = (token: string): { [key: string]: unknown } => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return {};
  }
};

export const VerifyJwt = (token: string): boolean => {
  try {
    const payload = ParseJwt(token);
    const exp =
      typeof payload.exp === "number" ? payload.exp : Number(payload.exp);
    if (!exp || isNaN(exp)) {
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime < exp;
  } catch (error) {
    console.error("Failed to verify JWT:", error);
    return false;
  }
};
