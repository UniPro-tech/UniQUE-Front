export const convertToDateTimeString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const convertToDateTime = (obj: any): object | null => {
  if (!obj) {
    return null;
  }
  for (const key in obj) {
    if (
      (key.endsWith("_at") || key.endsWith("At") || key.endsWith("until")) &&
      obj[key] instanceof Date
    ) {
      obj[key] = convertToDateTimeString(obj[key]);
    }
  }
  return obj;
};
