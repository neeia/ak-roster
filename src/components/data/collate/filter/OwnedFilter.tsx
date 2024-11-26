import { Check, Clear } from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";
import { Value } from "util/hooks/useFilter";

interface Props {
  value: Set<Value>;
  onChange: (value: boolean) => void;
}
const OwnedFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      onChange={(_, v) => onChange(v)}
      sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: 48 }}
    >
      <ToggleButton value={true}>
        <Check color="success" />
      </ToggleButton>
      <ToggleButton value={false}>
        <Clear color="error" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default OwnedFilter;
