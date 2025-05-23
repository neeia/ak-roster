import { Box, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import Image from "components/base/Image";
import React from "react";
import imageBase from "util/imageBase";

const classList = ["Vanguard", "Guard", "Defender", "Sniper", "Caster", "Medic", "Supporter", "Specialist"];

interface Props extends Omit<ToggleButtonGroupProps, "onChange"> {
  onChange: (value: string) => void;
}

const ClassFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" },
        width: "100%",
        gap: 1,
      }}
    >
      {classList.map((c) => (
        <ToggleButton
          value={c}
          key={c}
          onChange={() => onChange(c)}
          sx={{
            "&:not(._):not(._)": {
              borderRadius: 1,
            },
          }}
        >
          <Box
            sx={{
              filter: "drop-shadow(0px 0px 2px #000)",
            }}
          >
            <Image width={40} height={40} src={`${imageBase}/classes/class_${c.toLowerCase()}.webp`} alt={c} />
          </Box>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ClassFilter;
