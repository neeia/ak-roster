import React, { memo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Class from "../input/Select/Class";
import OwnedFilter from "./filter/OwnedFilter";
import ServerFilter from "./filter/ServerFilter";
import { Close, FilterAltOutlined } from "@mui/icons-material";
import { Filters, ToggleFilter, ClearFilters } from "util/hooks/useFilter";
import Select from "../input/Select/SelectGroup";
import Rarity from "../input/Select/Rarity";
import Promotion from "../input/Select/Promotion";
import PropertyLevel from "../input/Select/PropertyLevel";
import FavoriteFilter from "./filter/FavoriteFilter";
import PoolsFilter from "./filter/PoolsFilter";
import MasteryFilter from "./filter/MasteryFilter";
import classList from "data/classList";
import { getBranches, getClasses } from "util/fns/classesUtils";

interface Props {
  filter: Filters;
  toggleFilter: ToggleFilter;
  clearFilters: ClearFilters;
}

const FilterDialog = memo((props: Props) => {
  const { filter, clearFilters, toggleFilter } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = React.useState(false);

  const [expandedClass, setExpandedClass] = React.useState<string | null>(null);

  const handleToggleClassOrBranch = (val: string): void => {
    const isClass = classList.includes(val);

    if (isClass) {
      handleClassToggle(val);
    } else {
      handleBranchToggle(val);
    }
  };

  const handleClassToggle = (val: string): void => {
    const wasOn = filter.CLASS.has(val);

    if (wasOn && expandedClass !== val) {
      setExpandedClass(val);
      clearInactiveClassses("CLASS", val);
      return;
    }

    toggleFilter("CLASS", val);

    if (wasOn) {
      clearFilters("BRANCH", getBranches(val));
    } else {
      setExpandedClass(val);
    }
    clearInactiveClassses("CLASS", val);
  };

  const handleBranchToggle = (val: string): void => {
    const wasOn = filter.BRANCH.has(val);
    toggleFilter("BRANCH", val);

    if (!wasOn) {
      clearInactiveClassses("BRANCH", val);
    }
  };

  const clearInactiveClassses = (toggle: "BRANCH" | "CLASS", val: string) => {
    if (toggle === "CLASS" && filter.BRANCH.size === 0) return;

    const activeBranches =
      toggle === "BRANCH"
        ? new Set(filter.BRANCH).add(val)
        : new Set(filter.BRANCH);

    const activeClassesOfBranches =
      toggle === "BRANCH"
        ? getClasses([...activeBranches] as string[])
        : getClasses([...activeBranches] as string[]).add(val);

    const activeClasses =
      toggle === "BRANCH"
        ? new Set(filter.CLASS) as Set<string>
        : (new Set(filter.CLASS) as Set<string>).add(val);

    const inactiveClasses = [...activeClasses]
      .filter((c) =>
        !activeClassesOfBranches.has(c));
    if (inactiveClasses.length === 0) return;

    clearFilters("CLASS", inactiveClasses);
  }

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
              gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(7, 1fr)" },
              width: "100%",
            }}
          >
            <Select title="Class" nobg sx={{ gridColumn: "1 / -1" }}>
              <Class expandedClass={expandedClass}
                value={[...filter.CLASS, ...filter.BRANCH]}
                onChange={handleToggleClassOrBranch}
                onBranchesClose={() => setExpandedClass(null)}
              />
            </Select>
            <Select title="Rarity" nobg sx={{ gridColumn: { xs: "1 / -1", sm: "span 4" } }}>
              <Rarity
                value={[...filter.RARITY]}
                onChange={(value) => toggleFilter("RARITY", value)}
                exclusive={false}
                fullWidth
              />
            </Select>
            <Select title="Elite" nobg sx={{ gridColumn: { xs: "span 2", sm: "span 3" } }}>
              <Promotion value={[...filter.ELITE]} onChange={(value) => toggleFilter("ELITE", value)} />
            </Select>
            <Select title="Owned" nobg sx={{ gridColumn: { xs: "span 2", sm: "span 2" } }}>
              <Stack direction="row" justifyContent="center">
                <OwnedFilter value={[...filter.OWNED]} onChange={(value) => toggleFilter("OWNED", value)} />
                <FavoriteFilter value={[...filter.FAVORITE]} onChange={(value) => toggleFilter("FAVORITE", value)} />
              </Stack>
            </Select>
            <Select title="Server" nobg sx={{ gridColumn: { xs: "span 2", sm: "span 1" } }}>
              <ServerFilter value={[...filter.CN]} onChange={(value) => toggleFilter("CN", value)} />
            </Select>
            <Select title="Module" nobg sx={{ gridColumn: { xs: "span 2", sm: "span 1" } }}>
              <ServerFilter value={[...filter.MODULECN]} onChange={(value) => toggleFilter("MODULECN", value)} />
            </Select>
            <Select title="Module Level" nobg sx={{ gridColumn: { xs: "1 / -1", sm: "span 3" } }}>
              <PropertyLevel property="module"
                value={[...filter.MODULELEVEL]} onChange={(value) => toggleFilter("MODULELEVEL", value)} />
            </Select>
            <Select title="Skill Level" nobg sx={{ gridColumn: "span 2" }}>
              <PropertyLevel property="skill" fullWidth min={1} max={7} step={3}
                value={[...filter.SKILLLEVEL]} onChange={(value) => toggleFilter("SKILLLEVEL", value)} />
            </Select>
            <Select title="Mastery" nobg sx={{ gridColumn: { xs: "1 / -1", sm: "span 5" } }}>
              <MasteryFilter property="mastery"
                value={[...filter.MASTERY]} onChange={(value) => toggleFilter("MASTERY", value)} />
            </Select>
            <Select title="Pools" nobg sx={{ whiteSpace: "nowrap", gridColumn: "1 / -1" }}>
              <PoolsFilter property="Pools"
                value={[...filter.POOLS]} onChange={(value) => toggleFilter("POOLS", value)} />
            </Select>
          </Box>
          <Stack direction="row" justifyContent="space-between">
            <Button fullWidth
              onClick={() => {
                clearFilters();
                setExpandedClass(null);
              }}>
              Clear Filter
            </Button>
            <Button variant="contained" onClick={() => setOpen(false)} sx={{ display: { md: "none" } }}>Close</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
});
FilterDialog.displayName = "FilterDialog";
export default FilterDialog;
