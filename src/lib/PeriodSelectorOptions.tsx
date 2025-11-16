"use client";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

/**
 * ## PeriodSelectorOptions
 *　所属期の選択肢を生成するコンポーネント
 * @returns React.JSX 所属期のMenuItem
 */
export default function PeriodSelectorOptions() {
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

  return (
    <FormControl fullWidth>
      <InputLabel id="period-label" required>
        所属期
      </InputLabel>
      <Select
        labelId="period-label"
        name="period"
        fullWidth
        label="所属期"
        color="primary"
        variant="outlined"
        required
        sx={{ display: "flex", flexDirection: "row" }}
      >
        {periods.map((period) => (
          <MenuItem
            key={period}
            value={period}
            sx={{ display: "flex", flexDirection: "row" }}
          >
            <Typography>{period}期</Typography>
            <Typography
              variant="caption"
              sx={{ ml: 1, color: "text.secondary" }}
            >
              ({startYear + parseInt(period) - 1}年度{" "}
              {period.slice(0) == "0"
                ? "早期活動者"
                : `${
                    quoter.find((q) => q.name === period.slice(1))?.month
                  }月以降`}
              )
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
