import React, { memo, useContext } from "react";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import { DisabledContext } from "./SelectGroup";
import Image from "next/image";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange: (skillLevel: number) => void;
}
const SkillLevel = memo((props: Props) => {
  const { value, min = 1, max = 7, size = 32, disabled: _disabled = false, sx, onChange, ...rest } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  return (
    <ToggleButtonGroup
      value={value}
      aria-label="Skill Level"
      disabled={disabled}
      sx={{
        display: "flex",
        borderRadius: 1,
        flexWrap: "wrap",
        gap: 1,
        ...sx,
      }}
      {...rest}
    >
      {[...Array(max + 1).keys()]
        .filter((n) => min <= n && n <= max)
        .map((n) => (
          <ToggleButton
            key={n}
            value={n}
            onChange={() => onChange(n)}
            sx={{
              p: 1,
              "&:not(._):not(._)": {
                borderRadius: 1,
              },
            }}
          >
            <Image width={size} height={size} src={`/img/rank/${n}.png`} alt={`Rank ${n}`} />
          </ToggleButton>
        ))}
    </ToggleButtonGroup>
  );
});
SkillLevel.displayName = "Skill Level";
export default SkillLevel;
