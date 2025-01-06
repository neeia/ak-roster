import { MenuItem, Select, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  value: number | null;
  onChange: (index: number) => void;
  children: ReactNode[];
  mobile?: boolean;
  disable?: number[];
}
const SupportOption = (props: Props) => {
  const { value, onChange, children, mobile, disable = [] } = props;

  return mobile ? (
    <Select value={value} sx={{ height: 81 }} MenuProps={{ sx: { "& ul.MuiList-root": { py: "1px" } } }}>
      {children.map((child, i) => (
        <MenuItem
          value={i}
          key={i}
          sx={{ px: 0, justifyContent: "center" }}
          onChange={() => onChange(i)}
          disabled={disable.includes(i)}
        >
          {child}
        </MenuItem>
      ))}
    </Select>
  ) : (
    <ToggleButtonGroup value={value} sx={{ height: "min-content" }}>
      {children.map((child, i) => (
        <ToggleButton value={i} key={i} onChange={() => onChange(i)} disabled={disable.includes(i)}>
          {child}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default SupportOption;
