/**
 * User Status options
 */
export const USER_STATUS_OPTIONS = [
  { value: "established", label: "Established" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
] as const;

export type UserStatus = (typeof USER_STATUS_OPTIONS)[number]["value"];

/**
 * 選択可能な所属期を取得
 * @returns 選択可能な所属期のオプション
 */
export function getSelectableAffiliationPeriods(): Array<{
  value: string;
  label: string;
}> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const startYear = 2024; // サークル開始年を設定
  const periods = ["0"];
  const quoter = [
    {
      month: 4,
      name: "A",
    },
    {
      month: 7,
      name: "B",
    },
    {
      month: 10,
      name: "C",
    },
    {
      month: 1,
      name: "D",
    },
  ];
  for (let year = startYear; year <= currentYear; year++) {
    for (const q of quoter) {
      if (year === startYear && q.month <= 3) continue; // 0期はすでに追加されているのでスキップ
      if (
        year === currentYear &&
        (currentMonth < q.month || (q.month === 1 && currentMonth >= 4))
      )
        break; // 今年度でまだ来ていない期はスキップ
      const period = `${year - startYear + 1 < 10 ? "0" + (year - startYear + 1) : year - startYear + 1}${q.name}`;
      periods.push(period);
    }
  }

  return periods.map((period) => ({
    value: period,
    label: period.toLowerCase(),
  }));
}

/**
 * User Affiliation Period options
 * デフォルトの定数（互換性維持用）
 */
export const AFFILIATION_PERIOD_OPTIONS = getSelectableAffiliationPeriods();

/**
 * ステータスラベルを取得
 */
export function getStatusLabel(status?: string | null): string {
  if (!status) return "";
  const option = USER_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
}

/**
 * 所属期ラベルを取得
 */
export function getAffiliationPeriodLabel(period?: string | null): string {
  if (!period) return "";
  // 値そのものがラベル（例: "0", "1A", "2B"）
  return period;
}

// === Affiliation helpers (公開用) ===
export const AFFILIATION_START_YEAR = 2024;
export const AFFILIATION_QUOTER = [
  { month: 4, name: "A" },
  { month: 7, name: "B" },
  { month: 10, name: "C" },
  { month: 1, name: "D" },
] as const;

export function getAffiliationPeriodInfo(period: string) {
  if (period === "0") {
    return {
      isEarly: true,
      year: AFFILIATION_START_YEAR,
      month: undefined as number | undefined,
      label: "早期活動者",
    };
  }
  const idx = period.length - 1;
  const numPart = period.slice(0, idx);
  const letter = period.slice(idx);
  const num = parseInt(numPart, 10);
  const year = AFFILIATION_START_YEAR + num - 1;
  const q = AFFILIATION_QUOTER.find((x) => x.name === letter);
  return {
    isEarly: false,
    year,
    month: q?.month,
    label: q ? `${q.month}月以降` : "",
  };
}
