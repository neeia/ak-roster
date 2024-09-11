import { Box, Divider, IconButton } from "@mui/material";
import React from "react";

interface Props {
  enMod: boolean;
  cnMod: boolean;
  toggleEN: () => void;
  toggleCN: () => void;
}
const ModuleFilter = (props: Props) => {
  const { enMod, cnMod, toggleEN, toggleCN } = props;

  const r = 4;
  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box>
        <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
          Has Module
        </Divider>
      </Box>
      <Box display="grid" gridTemplateColumns="1fr 1fr" width="100%" height="100%">
        <IconButton
          className={enMod ? "active" : "inactive"}
          sx={{ borderRadius: `${r}px 0px 0px ${r}px` }}
          onClick={() => toggleEN()}
        >
          EN
        </IconButton>
        <IconButton
          className={cnMod ? "active" : "inactive"}
          sx={{ borderRadius: `0px ${r}px ${r}px 0px` }}
          onClick={() => toggleCN()}
        >
          CN
        </IconButton>
      </Box>
    </Box>);
}

export default ModuleFilter;