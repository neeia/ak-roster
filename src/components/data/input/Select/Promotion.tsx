import React, { memo, useContext } from "react";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import Image from "next/image";
import { DisabledContext } from "./SelectGroup";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
}
const Promotion = memo((props: Props) => {
  const {
    value,
    min: minPromotion = 0,
    max: maxPromotion = 2,
    onChange,
    disabled: _disabled = false,
    size = 32,
    sx,
    ...rest
  } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  return (
    <ToggleButtonGroup
      value={value}
      aria-label="Promotion"
      disabled={disabled}
      sx={{
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        width: "min-content",
        height: "min-content",
        ...sx,
      }}
      {...rest}
    >
      {[...Array(maxPromotion + 1).keys()]
        .filter((n) => n >= minPromotion && n <= maxPromotion)
        .map((n) => (
          <ToggleButton
            key={n}
            value={n}
            onChange={() => onChange(n)}
            sx={{
              "& img": { filter: "drop-shadow(0px 0px 1px #000)" },
            }}
          >
            <Image width={size} height={size} src={`/img/elite/${n}.png`} alt={`Elite ${n}`} />
          </ToggleButton>
        ))}
    </ToggleButtonGroup>
  );
});
Promotion.displayName = "Promotion";
export default Promotion;
