export const toCamelcase = <T>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelcase(item)) as unknown as T;
  } else if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      newObj[camelKey] = toCamelcase(obj[key]);
    }
    return newObj as T;
  }
  return obj as T;
};
