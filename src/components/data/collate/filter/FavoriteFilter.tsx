import { Favorite } from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";
import { Value } from "util/hooks/useFilter";

interface Props {
  value: Value[];
  onChange: (value: boolean) => void;
}
const FavoriteFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <ToggleButtonGroup
      value={value}
      sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: 48 }}
    >
      <ToggleButton sx={{ minWidth: "40px" }} value={true} onChange={() => onChange(true)}>
        <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default FavoriteFilter;
