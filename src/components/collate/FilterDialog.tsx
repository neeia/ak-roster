import React, { memo, useEffect, useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FilterFunction } from "../../types/filter";
import ClassFilter from "./filter/ClassFilter";
import OwnedFilter from "./filter/OwnedFilter";
import RarityFilter from "./filter/RarityFilter";
import ServerFilter from "./filter/ServerFilter";
import PromotionFilter from "./filter/PromotionFilter";
import ModuleFilter from "./filter/ModuleFilter";
import { Close, FilterAltOutlined } from "@mui/icons-material";
import { Operator, OpJsonObj } from "../../types/operator";
import { AccountInfo } from "../../types/doctor";
import useLocalStorage from "../../util/useLocalStorage";

interface Props {
  filter: Record<string, Record<string, FilterFunction>>;
  clearFilters: () => void;
  addFilter: (property: string, key: string, value: FilterFunction) => void;
  removeFilter: (property: string, key: string) => void;
}

const FilterDialog = memo((props: Props) => {
  const { filter, clearFilters, addFilter, removeFilter } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const activeClasses = Object.keys(filter["class"] ?? {});
  const setClassFilter = (value: string) => {
    const filterKey = "class"
    if (activeClasses.includes(value)) {
      removeFilter(filterKey, value);
    } else {
      addFilter(filterKey, value, (op: Operator) => op.class === value);
    }
  }

  const enMod = filter["mod"] && !!filter["mod"]["EN"];
  const cnMod = filter["mod"] && !!filter["mod"]["CN"];
  const toggleENMod = () => {
    const filterKey = "mod";
    const propKey = "EN";
    if (enMod) {
      removeFilter(filterKey, propKey);
    }
    else {
      addFilter(filterKey, propKey, (_, op) => op.modules.some(mod => !mod.isCnOnly));
    }
  }
  const toggleCNMod = () => {
    const filterKey = "mod";
    const propKey = "CN";
    if (cnMod) {
      removeFilter(filterKey, propKey);
    }
    else {
      addFilter(filterKey, propKey, (_, op) => op.modules.some(mod => mod.isCnOnly));
    }
  }

  const ownedFilter = filter["owned"] && filter["owned"]["owned"]
    && filter["owned"]["owned"]({ owned: true } as any, {} as any);
  const toggleOwned = (value: boolean) => {
    const filterKey = "owned";
    if (ownedFilter === value) {
      removeFilter(filterKey, filterKey);
    }
    else {
      addFilter(filterKey, filterKey, (op) => op.owned === value);
    }
  }

  const eliteFilter = Object.keys(filter["promotion"] ?? {}).map(s => parseInt(s));
  const toggleElite = (value: number) => {
    const filterKey = "promotion";
    const nr = [...eliteFilter];
    if (eliteFilter.includes(value)) {
      removeFilter(filterKey, value.toString());
    } else {
      addFilter(filterKey, value.toString(), (op: Operator) => op.promotion === value);
      nr.push(value);
    }
  }

  const rarityFilter = Object.keys(filter["rarity"] ?? {}).map(s => parseInt(s));
  const toggleRarity = (n: number) => {
    const filterKey = "rarity";
    const nr = [...rarityFilter];
    if (rarityFilter.includes(n)) {
      removeFilter(filterKey, n.toString());
    } else {
      addFilter(filterKey, n.toString(), (op: Operator) => op.rarity === n);
      nr.push(n)
    }
  }

  const en = filter["cn"] && !!filter["cn"]["EN"]
  const cn = filter["cn"] && !!filter["cn"]["CN"]
  const toggleEN = () => {
    const filterKey = "cn";
    if (en) {
      removeFilter(filterKey, "EN");
    }
    else {
      addFilter(filterKey, "EN", (_, opInfo: OpJsonObj) => !opInfo.isCnOnly);
    }
  }
  const toggleCN = () => {
    const filterKey = "cn";
    if (cn) {
      removeFilter(filterKey, "CN");
    }
    else {
      addFilter(filterKey, "CN", (_, opInfo: OpJsonObj) => opInfo.isCnOnly);
    }
  }

  const [doctor] = useLocalStorage<AccountInfo>("doctor", {});
  useEffect(() => {
    const filterKey = "cn";
    if (doctor.server !== "CN") addFilter(filterKey, "EN", (_, opInfo: OpJsonObj) => !opInfo.isCnOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <IconButton onClick={() => { setOpen(true); }} aria-label="Filter">
        <FilterAltOutlined fontSize="large" color="primary" />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        keepMounted
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "12px",
        }}>
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}>
            Filters
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          "& .MuiButtonBase-root": {
            boxShadow: 1,
            backgroundColor: "info.main",
          },
          "& .inactive": {
            opacity: 0.9,
            py: "0.6rem",
          },
          "& .active": {
            opacity: 1,
            boxShadow: 0,
            pt: "0.6rem",
            borderBottomWidth: "0.25rem",
            borderBottomColor: "primary.main",
            borderBottomStyle: "solid",
            backgroundColor: "info.light",
          },
          "& .MuiButton-root, .MuiIconButton-root": {
            height: "3rem"
          }
        }}>
          <Box sx={{ width: "100%" }}>
            <ClassFilter
              activeClasses={activeClasses}
              setClassFilter={setClassFilter}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "3fr 4fr", sm: "3fr 4fr 4fr" }, gap: 2, width: "100%" }}>
            <Box sx={{ gridColumn: "span 2", width: "100%" }}>
              <RarityFilter
                activeRarities={rarityFilter}
                toggleFilter={toggleRarity}
              />
            </Box>
            <PromotionFilter
              activePromotions={eliteFilter}
              toggleFilter={toggleElite}
            />
            <OwnedFilter
              ownedFilter={ownedFilter}
              toggleFilter={toggleOwned}
            />
            <ServerFilter
              en={en}
              cn={cn}
              toggleEN={toggleEN}
              toggleCN={toggleCN}
            />
            <ModuleFilter
              enMod={enMod}
              cnMod={cnMod}
              toggleEN={toggleENMod}
              toggleCN={toggleCNMod}
            />
          </Box>
          <Button onClick={clearFilters}>
            Clear Filter
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
});
FilterDialog.displayName = "FilterDialog";
export default FilterDialog;
