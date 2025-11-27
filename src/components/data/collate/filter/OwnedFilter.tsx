import { Check, Clear } from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";
import { Value } from "util/hooks/useFilter";

interface Props {
  value: Value[];
  onChange: (value: boolean) => void;
}
const OwnedFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: 48 }}
    >
      <ToggleButton sx={{ minWidth: "40px", "&:not(._):not(._)": { borderRadius: 1 } }} value={true} onChange={() => onChange(true)}>
        <Check color="success" />
      </ToggleButton>
      <ToggleButton sx={{ minWidth: "40px", "&:not(._):not(._)": { borderRadius: 1 } }} value={false} onChange={() => onChange(false)}>
        <Clear color="error" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default OwnedFilter;
