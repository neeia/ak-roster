import { Check, Clear } from "@mui/icons-material";
import { Box, Divider, IconButton } from "@mui/material";
import React from "react";
import { Value } from "util/hooks/useFilter";

interface Props {
  value: Set<Value>;
  onChange: (value: boolean) => void;
}
const OwnedFilter = (props: Props) => {
  const { value, onChange: toggleFilter } = props;

  const r = 4;
  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box>
        <Divider sx={{ mt: 1, mb: 0.5 }} variant="middle" flexItem>
          Owned
        </Divider>
      </Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(2, 1fr)"
        width="100%"
        height="100%"
      >
        <IconButton
          className={value.has(true) ? "active" : "inactive"}
          sx={{ borderRadius: `${r}px 0px 0px ${r}px` }}
          onClick={() => toggleFilter(true)}
        >
          <Check color="success" />
        </IconButton>
        <IconButton
          className={value.has(true) ? "active" : "inactive"}
          sx={{ borderRadius: `0px ${r}px ${r}px 0px` }}
          onClick={() => toggleFilter(false)}
        >
          <Clear color="error" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default OwnedFilter;
