export const parseUA = (userAgent: string) => {
  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
  const ua = userAgent.toLowerCase();
  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("chrome")) {
    browser = "Google Chrome";
  } else if (ua.includes("safari")) {
    browser = "Safari";
  } else if (ua.includes("firefox")) {
    browser = "Mozilla Firefox";
  } else if (ua.includes("edg")) {
    browser = "Microsoft Edge";
  }

  if (ua.includes("mac os x")) {
    os = "macOS";
  } else if (ua.includes("windows nt")) {
    os = "Windows";
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("android")) {
    os = "Android";
  }

  return { browser, os };
};
