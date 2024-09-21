import React, { memo } from "react";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, Tooltip } from "@mui/material";
import Image from "next/image";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
  bonuses?: string;
}
const Potential = memo((props: Props) => {
  const { value, min = 1, max = 6, onChange, disabled = false, size = 32, bonuses, sx, ...rest } = props;

  return (
    <ToggleButtonGroup exclusive value={value}
      onChange={(_, i) => { if (i !== null) onChange(i) }}
      disabled={disabled}
      sx={{
        width: "min-content",
        height: "min-content",
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        ...sx
      }}
      {...rest}
    >
      {[...Array(max + 1).keys()]
        .filter(n => n >= min && n <= max)
        .map(n =>
          <Tooltip key={n} title={bonuses
            ? n === 0
              ? "Unlock"
              : bonuses[n - 1]
            : ""
          }
            arrow
          >
            <span>
              <ToggleButton key={n} value={n}>
                <Image
                  width={32}
                  height={32}
                  src={`/img/potential/${n}.png`}
                  alt={`Potential ${n}`}
                />
              </ToggleButton>
            </span>
          </Tooltip>
        )}
    </ToggleButtonGroup>
  )
})
export default Potential;