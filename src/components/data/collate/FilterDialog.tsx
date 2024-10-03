import React, { memo, useCallback } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FilterFunction } from "types/filter";
import ClassFilter from "./filter/ClassFilter";
import OwnedFilter from "./filter/OwnedFilter";
import RarityFilter from "./filter/RarityFilter";
import ServerFilter from "./filter/ServerFilter";
import PromotionFilter from "./filter/PromotionFilter";
import ModuleFilter from "./filter/ModuleFilter";
import { Close, FilterAltOutlined } from "@mui/icons-material";
import { Filters, ToggleFilter } from "util/useFilter";

interface Props {
  filter: Filters;
  toggleFilter: ToggleFilter;
  clearFilters: () => void;
}

const FilterDialog = memo((props: Props) => {
  const { filter, clearFilters, toggleFilter } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
              value={filter.CLASS}
              onChange={(value) => toggleFilter("CLASS", value)}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "3fr 4fr", sm: "3fr 4fr 4fr" }, gap: 2, width: "100%" }}>
            <Box sx={{ gridColumn: "span 2", width: "100%" }}>
              <RarityFilter
                value={filter.RARITY}
                onChange={(value) => toggleFilter("RARITY", value)}
              />
            </Box>
            <PromotionFilter
              value={filter.ELITE}
              onChange={(value) => toggleFilter("ELITE", value)}
            />
            <OwnedFilter
              value={filter.OWNED}
              onChange={(value) => toggleFilter("OWNED", value)}
            />
            <ServerFilter
              value={filter.CN}
              onChange={(value) => toggleFilter("CN", value)}
            />
            <ModuleFilter
              value={filter.MODULECN}
              onChange={(value) => toggleFilter("MODULECN", value)}
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
