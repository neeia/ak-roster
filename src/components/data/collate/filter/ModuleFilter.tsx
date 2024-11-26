import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";
import { Value } from "util/hooks/useFilter";

interface Props {
  value: Set<Value>;
  onChange: (value: boolean) => void;
}
const ModuleFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      onChange={(_, v) => onChange(v)}
      sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}
    >
      <ToggleButton value={false}>EN</ToggleButton>
      <ToggleButton value={true}>CN</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ModuleFilter;
