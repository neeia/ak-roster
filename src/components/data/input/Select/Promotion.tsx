import React, { memo } from "react";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import Image from "next/image";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
}
const Promotion = memo((props: Props) => {
  const { value, min: minPromotion = 0, max: maxPromotion = 2, onChange, disabled = false, size = 32, sx, ...rest } = props;

  return (
    <ToggleButtonGroup exclusive value={value}
      disabled={disabled}
      onChange={(_, i) => { if (i !== null) onChange(i) }}
      sx={{
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        width: "min-content",
        height: "min-content",
        ...sx
      }}
      {...rest}
    >
      {[...Array(maxPromotion + 1).keys()]
        .filter(n => n >= minPromotion && n <= maxPromotion)
        .map(n =>
          <ToggleButton key={n} value={n}>
            <Image width={size} height={size}
              src={`/img/elite/${n}.png`}
              alt={`Elite ${n}`}
            />
          </ToggleButton>
        )}
    </ToggleButtonGroup>
  )
})
export default Promotion;