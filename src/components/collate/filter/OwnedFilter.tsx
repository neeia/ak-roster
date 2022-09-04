import { Check, Clear } from "@mui/icons-material";
import { Box, Divider, IconButton } from "@mui/material";
import React from "react";

interface Props {
  ownedFilter: boolean | undefined;
  toggleFilter: (value: boolean) => void;
}
const OwnedFilter = (props: Props) => {
  const { ownedFilter, toggleFilter } = props;


  const r = 4;
  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box>
        <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
          Owned
        </Divider>
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" width="100%" height="100%">
        <IconButton
          className={ownedFilter === true ? "active" : "inactive"}
          sx={{ borderRadius: `${r}px 0px 0px ${r}px` }}
          onClick={() => toggleFilter(true)}
        >
          <Check htmlColor="lightgreen" />
        </IconButton>
        <IconButton
          className={ownedFilter === false ? "active" : "inactive"}
          sx={{ borderRadius: `0px ${r}px ${r}px 0px` }}
          onClick={() => toggleFilter(false)}
        >
          <Clear htmlColor="red" />
        </IconButton>
      </Box>
    </Box>);
}

export default OwnedFilter;