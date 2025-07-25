import { Box, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import React from "react";

const poolsList = ["Standard", "Limited", "Free", "Kernel", "Recruitment","Kernel CN" ];

interface Props extends Omit<ToggleButtonGroupProps, "onChange"> {
  onChange: (value: string) => void;
}

const PoolsFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: {xs: "center", sm: "flex-start"},
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
