import { Box, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import React from "react";

const poolsList = ["Standard", "Limited", "Kernel", "Kernel CN", "Free"];

interface Props extends Omit<ToggleButtonGroupProps, "onChange"> {
  onChange: (value: string) => void;
}

const PoolsFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" },
        width: "100%",
        gap: 0.5,
      }}
    >
      {poolsList.map((c) => (
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
            {c}
          </Box>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default PoolsFilter;
