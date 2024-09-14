import React from "react";
import { SxProps, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import Image from "components/base/Image";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  minPromotion? : number;
  maxPromotion?: number;
  onChange: (promotion: number) => void;
  disabled?: boolean;
  size?: number;
}
const PromotionSelector = ((props: Props) => {
  const { value, minPromotion, maxPromotion, onChange, disabled, size = 32 } = props;

  return (
    <ToggleButtonGroup value={value}
      exclusive
      onChange={(_, i) => { if (i !== null) onChange(i) }}
      sx={{
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        width: "min-content",
        height: "48px",
      }}
    >
      {[...Array(maxPromotion ? maxPromotion + 1 : 3)].map((_, i) =>
        <ToggleButton
          disabled={disabled || (i < (minPromotion ?? 0))}
          key={i}
          value={i}
          aria-label={`elite ${i}`}
        >
          <Image
            sx={{ width: `${size}px`, height: `${size}px` }}
            src={`/img/elite/${i}.png`}
            alt={`Elite ${i} Button`}
          />
        </ToggleButton>
      )}
    </ToggleButtonGroup>
  )
})
export default PromotionSelector;