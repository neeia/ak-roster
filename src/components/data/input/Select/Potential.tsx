import React, { memo, useContext } from "react";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, Tooltip } from "@mui/material";
import Image from "next/image";
import { DisabledContext } from "./SelectGroup";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
  bonuses?: string[];
}
const Potential = memo((props: Props) => {
  const { value, min = 1, max = 6, onChange, disabled: _disabled = false, size = 32, bonuses, sx, ...rest } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  return (
    <ToggleButtonGroup
      value={value}
      onChange={(_, i) => onChange(i)}
      disabled={disabled}
      sx={{
        width: "min-content",
        height: "min-content",
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        ...sx,
      }}
      {...rest}
    >
      {[...Array(max + 1).keys()]
        .filter((n) => min <= n && n <= max)
        .map((n) => (
          // <Tooltip key={n} title={bonuses ? (n === 1 ? "Unlock" : bonuses[n - 1]) : ""} arrow>
          <ToggleButton key={n} value={n} sx={{ p: 1 }}>
            <Image width={size} height={size} src={`/img/potential/${n}.png`} alt={`Potential ${n}`} />
          </ToggleButton>
          // </Tooltip>
        ))}
    </ToggleButtonGroup>
  );
});
Potential.displayName = "Potential";
export default Potential;
