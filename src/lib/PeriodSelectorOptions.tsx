"use client";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  AFFILIATION_PERIOD_OPTIONS,
  getAffiliationPeriodInfo,
} from "@/lib/constants/UserConstants";

/**
 * ## PeriodSelectorOptions
 *　所属期の選択肢を生成するコンポーネント
 * @returns React.JSX 所属期のMenuItem
 */
export default function PeriodSelectorOptions() {
  const periods = AFFILIATION_PERIOD_OPTIONS;

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
        {periods.map((p) => {
          const period = p.value;
          const info = getAffiliationPeriodInfo(period);
          return (
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
                ({info.year}年度 {info.label})
              </Typography>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
