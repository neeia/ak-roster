import React, { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, MenuItem, TextField, useMediaQuery, useTheme } from "@mui/material";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import { FilterFunction } from "../../types/filter";
import ServerFilter from "./filter/ServerFilter";

interface Props {
  open: boolean;
  onClose: () => void;
  addFilter: (property: string, key: string, value: FilterFunction) => void;
  removeFilter: (property: string, key: string) => void;
}

/*
 * Filter by:
 * CN/EN
 * Owned
 * Class
 * Rarity
 * Favorite
 * Potential
 * []Promotion
 * Module Available
 */
const FilterDialog = (props: Props) => {
  const { open, onClose, addFilter, removeFilter } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));


  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        keepMounted
      >
        <DialogTitle sx={{
          alignSelf: "start",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          paddingBottom: "12px",
        }}>
          Filters
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <ServerFilter addFilter={addFilter} removeFilter={removeFilter} />
        </DialogContent>
      </Dialog>
    </>
  );
}
export default FilterDialog;
