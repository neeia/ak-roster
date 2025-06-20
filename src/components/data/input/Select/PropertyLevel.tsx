import React, { memo, useContext } from "react";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import { DisabledContext } from "./SelectGroup";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  min?: number;
  max?: number;
  size?: number;
  onChange: (PropertyLevel: number) => void;
  property: string;
}
const PropertyLevel = memo((props: Props) => {
  const { value, min = 0, max = 3, size = 32, disabled: _disabled = false, sx, onChange, property = "skill", ...rest } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  const getPath = () => {
    switch (property) {
      case "mastery": return "/rank/m-";
      case "module": return "/equip/img_stg";
      case "skill": return "/rank/";
      default: return "/rank/m-";
    }
  }

  return (
    <ToggleButtonGroup
      value={value}
      aria-label={`${property} Level`}
      disabled={disabled}
      sx={{
        display: "flex",
        borderRadius: 1,
        flexWrap: "nowrap",
        gap: 0,
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
              "& img": { filter: "drop-shadow(0px 0px 2px #000)" },
            }}
          >
            <Image width={size} height={size} src={`${imageBase}${getPath()}${n}.webp`} alt={`Rank ${n}`} />
          </ToggleButton>
        ))}
    </ToggleButtonGroup>
  );
});
PropertyLevel.displayName = "Property Level";
export default PropertyLevel;
