import React, { memo } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FilterFunction } from "types/filter";
import ClassFilter from "./filter/ClassFilter";
import OwnedFilter from "./filter/OwnedFilter";
import RarityFilter from "./filter/RarityFilter";
import ServerFilter from "./filter/ServerFilter";
import PromotionFilter from "./filter/PromotionFilter";
import ModuleFilter from "./filter/ModuleFilter";
import { Close, FilterAltOutlined } from "@mui/icons-material";
import { Operator, OperatorData } from "../../types/operator";
import SelFilter from "./filter/SelFilter";

const sixSel = ["Exusiai", "Siege", "Ifrit", "Eyjafjalla", "Angelina", "Shining",
  "Nightingale", "Hoshiguma", "Saria", "SilverAsh", "Skadi", "Ch'en", "Schwarz",
  "Hellagur", "Magallan", "Mostima", "Blaze", "Aak", "Ceobe", "Bagpipe", "Phantom",
  "Weedy", "Rosa", "Suzuran", "Thorns", "Eunectes", "Surtr", "Blemishine", "Mudrock",
  "Mountain", "Archetto", "Saga", "Passenger", "Kal'tsit", "Carnelian", "Pallas",
  "Mizuki", "Saileach", "Fartooth"];

const fiveSel = ["Ptilopsis", "Zima", "Texas", "Franka", "Lappland", "Specter",
  "Blue Poison", "Platinum", "Meteorite", "Skyfire", "Mayer", "Silence", "Warfarin",
  "Nearl", "Projekt Red", "Liskarm", "Croissant", "Provence", "Firewatch", "Cliffheart",
  "Pramanix", "Istina", "Sora", "Manticore", "FEater", "Nightmare", "Glaucus", "Swire",
  "Astesia", "Executor", "Waai Fu", "Reed", "Broca", "GreyThroat", "Hung", "Leizi",
  "Sesa", "Shamare", "Elysium", "Asbestos", "Tsukinogi", "Leonhardt", "Ayerscarpe",
  "Beeswax", "Chiave", "Andreana", "Flint", "April", "Aosta", "Whisperain", "Kafka",
  "Iris", "Mr. Nothing", "Toddifons"];

const sel = [fiveSel, sixSel];

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
      addFilter(filterKey, propKey, (_, op) => op.moduleData.some(mod => !mod.isCnOnly));
    }
  }
  const toggleCNMod = () => {
    const filterKey = "mod";
    const propKey = "CN";
    if (cnMod) {
      removeFilter(filterKey, propKey);
    }
    else {
      addFilter(filterKey, propKey, (_, op) => op.moduleData.some(mod => mod.isCnOnly));
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
      addFilter(filterKey, value.toString(), (op: Operator) => op.elite === value);
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
      addFilter(filterKey, "EN", (_, opInfo: OperatorData) => !opInfo.isCnOnly);
    }
  }
  const toggleCN = () => {
    const filterKey = "cn";
    if (cn) {
      removeFilter(filterKey, "CN");
    }
    else {
      addFilter(filterKey, "CN", (_, opInfo: OperatorData) => opInfo.isCnOnly);
    }
  }

  const five = filter["sel"] && !!filter["sel"]["five"]
  const six = filter["sel"] && !!filter["sel"]["six"]
  const toggleFive = () => {
    const filterKey = "sel";
    if (five) {
      removeFilter(filterKey, "five");
    }
    else {
      addFilter(filterKey, "five", (op) => fiveSel.includes(op.name));
    }
  }
  const toggleSix = () => {
    const filterKey = "sel";
    if (six) {
      removeFilter(filterKey, "six");
    }
    else {
      addFilter(filterKey, "six", (op) => sixSel.includes(op.name));
    }
  }

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip title="Filter" arrow describeChild>
        <IconButton
          onClick={() => { setOpen(true); }}
          aria-label="Filter"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <FilterAltOutlined fontSize="large" color="primary" />
          <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
            Filter
          </Typography>
        </IconButton>
      </Tooltip>
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
          <Box>
            <SelFilter
              five={five}
              six={six}
              toggleFive={toggleFive}
              toggleSix={toggleSix}
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
