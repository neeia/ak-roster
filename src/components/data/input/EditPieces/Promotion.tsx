import React, { memo } from "react";
import { SxProps, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import Image from "components/base/Image";
import SkillLevel from "./SkillLevel";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  minPromotion?: number;
  maxPromotion?: number;
  onChange: (promotion: number) => void;
  disabled?: boolean;
  size?: number;
}
const SelectPromotion = memo((props: Props) => {
  const { value, minPromotion, maxPromotion, onChange, disabled, size = 32 } = props;

  return (
    <ToggleButtonGroup value={value} className={disabled ? "Mui-disabled" : ""}
      disabled={disabled}
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
          disabled={(i < (minPromotion ?? 0))}
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
PromotionSelector.displayName = "PromotionSelector";
export default SelectPromotion;