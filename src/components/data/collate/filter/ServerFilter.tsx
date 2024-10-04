import { Box, Divider, IconButton } from "@mui/material";
import React from "react";
import { Value } from "util/useFilter";

interface Props {
  value: Set<Value>;
  onChange: (value: boolean) => void;
}
const ServerFilter = (props: Props) => {
  const { value, onChange } = props;

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box>
        <Divider sx={{ mt: 1, mb: 0.5 }} variant="middle" flexItem>
          Server
        </Divider>
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" width="100%">
        <IconButton
          className={value.has(false) ? "active" : "inactive"}
          onClick={() => onChange(false)}
        >
          EN
        </IconButton>
        <IconButton
          className={value.has(true) ? "active" : "inactive"}
          onClick={() => onChange(true)}
        >
          CN
        </IconButton>
      </Box>
    </Box>
  );
};

export default ServerFilter;
