import { Box, Divider, IconButton } from "@mui/material";
import React from "react";

interface Props {
  en: boolean;
  cn: boolean;
  toggleEN: () => void;
  toggleCN: () => void;
}
const ServerFilter = (props: Props) => {
  const { en, cn, toggleEN, toggleCN } = props;

  const r = 4;
  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box>
        <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
          Server
        </Divider>
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" width="100%">
        <IconButton
          className={en ? "active" : "inactive"}
          sx={{ borderRadius: `${r}px 0px 0px ${r}px` }}
          onClick={() => toggleEN()}
        >
          EN
        </IconButton>
        <IconButton
          className={cn ? "active" : "inactive"}
          sx={{ borderRadius: `0px ${r}px ${r}px 0px` }}
          onClick={() => toggleCN()}
        >
          CN
        </IconButton>
      </Box>
    </Box>);
}

export default ServerFilter;