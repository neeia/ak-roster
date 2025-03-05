import React, { memo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Class from "../input/Select/Class";
import OwnedFilter from "./filter/OwnedFilter";
import ServerFilter from "./filter/ServerFilter";
import { Close, FilterAltOutlined } from "@mui/icons-material";
import { Filters, ToggleFilter } from "util/hooks/useFilter";
import Select from "../input/Select/SelectGroup";
import Rarity from "../input/Select/Rarity";
import Promotion from "../input/Select/Promotion";

interface Props {
  filter: Filters;
  toggleFilter: ToggleFilter;
  clearFilters: () => void;
}

const FilterDialog = memo((props: Props) => {
  const { filter, clearFilters, toggleFilter } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip title="Filter" arrow describeChild>
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
          aria-label="Filter"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <FilterAltOutlined fontSize="large" />
          <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
            Filter
          </Typography>
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} fullScreen={fullScreen} keepMounted fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "12px",
          }}
        >
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}
          >
            Filters
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr auto" },
              width: "100%",
            }}
          >
            <Select title="Class" nobg sx={{ gridColumn: "1 / -1" }}>
              <Class value={[...filter.CLASS]} onChange={(value) => toggleFilter("CLASS", value)} />
            </Select>
            <Select title="Rarity" nobg sx={{ gridColumn: "span 2" }}>
              <Rarity
                value={[...filter.RARITY]}
                onChange={(value) => toggleFilter("RARITY", value)}
                exclusive={false}
                fullWidth
              />
            </Select>
            <Select title="Elite" nobg>
              <Promotion value={[...filter.ELITE]} onChange={(value) => toggleFilter("ELITE", value)} />
            </Select>
            <Select title="Owned" nobg>
              <OwnedFilter value={[...filter.OWNED]} onChange={(value) => toggleFilter("OWNED", value)} />
            </Select>
            <Select title="Server" nobg>
              <ServerFilter value={[...filter.CN]} onChange={(value) => toggleFilter("CN", value)} />
            </Select>
            <Select title="Module" nobg>
              <ServerFilter value={[...filter.MODULECN]} onChange={(value) => toggleFilter("MODULECN", value)} />
            </Select>
          </Box>
          <Button onClick={clearFilters}>Clear Filter</Button>
        </DialogContent>
      </Dialog>
    </>
  );
});
FilterDialog.displayName = "FilterDialog";
export default FilterDialog;
