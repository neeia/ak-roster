import { Box, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import React from "react";

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
          <Box component="img" width="2.5rem" src={`/img/classes/class_${c.toLowerCase()}.png`} alt={c} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ClassFilter;
