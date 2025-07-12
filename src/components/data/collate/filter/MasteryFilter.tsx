import React, { memo, useContext } from "react";
import { Box, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import { DisabledContext } from "../../input/Select/SelectGroup";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  min?: number;
  max?: number;
  size?: number;
  onChange: (PropertyLevel: number) => void;
}
const MasteryLevel = memo((props: Props) => {
  const { value, min = 0, max = 5, size = 32, disabled: _disabled = false, sx, onChange, ...rest } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  const path = "/rank/m-";

  return (
    <ToggleButtonGroup
      value={value}
      aria-label={`Mastery Level`}
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
        .map((n) => {
          const backLayerCount = n > 3 ? n - 3 : 0; // 4 → 1 layer, 5 → 2 layer
          const shift = 4;
          const spread = backLayerCount * shift;
          const halfSpread = spread / 2;
          return (

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
              <Box sx={{ position: "relative", width: size, height: size, }} >
                <Image width={size} height={size} src={`${imageBase}${path}${n - backLayerCount}.webp`} alt={`Rank ${n}`}
                  sx={{
                    position: "absolute",
                    top: halfSpread,
                    left: -halfSpread,
                    zIndex: backLayerCount + 1,
                  }} />
                {Array.from({ length: backLayerCount }).map((_, i) => {
                  const offset = i * shift - halfSpread;
                  return (
                  <Image
                    key={`back-${i}`}
                    width={size}
                    height={size}
                    src={`${imageBase}${path}${n - backLayerCount}.webp`}
                    alt={`Background Layer ${i + 1}`}
                    style={{
                      position: "absolute",
                      top: offset,
                      left: -offset,
                      zIndex: i + 1,
                      opacity: 0.7,
                    }}
                  />
                )})}
              </Box>
            </ToggleButton>
          )
        })}
    </ToggleButtonGroup>
  );
});
MasteryLevel.displayName = "Property Level";
export default MasteryLevel;
