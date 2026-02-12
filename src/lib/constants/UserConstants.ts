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
  const periods = ["00"];
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
    if (year === startYear && currentMonth <= 3) continue; // 0期はすでに追加されているのでスキップ
    for (const q of quoter) {
      if (
        year === currentYear &&
        (currentMonth < q.month || (q.month === 1 && currentMonth >= 4))
      )
        break; // 今年度でまだ来ていない期はスキップ
      const period = `${year - startYear + 1}${q.name}`;
      periods.push(period);
    }
  }

  return periods.map((period) => ({
    value: period,
    label: period,
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
