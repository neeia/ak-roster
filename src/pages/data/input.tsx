import React, { useCallback, useState } from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup, IconButton } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import { Operator, OpJsonObj } from "../../types/operator";
import { FilterAltOutlined, FormatPaintOutlined, Search } from "@mui/icons-material";
import SearchDialog from "../../components/collate/SearchDialog";
import FilterDialog from "../../components/collate/FilterDialog";
import SortDialog from "../../components/collate/SortDialog";
import { FilterFunction } from "../../types/filter";

export interface SortListItem {
  key: string;
  desc: boolean;
}
const sortFunctions = {
  "None": (): number => 0,
  "Name": (a: Operator, b: Operator): number => b.name.localeCompare(a.name),
  "Level": (a: Operator, b: Operator): number => a.level - b.level,
  "Rarity": (a: Operator, b: Operator): number => a.rarity - b.rarity,
  "Promotion": (a: Operator, b: Operator): number => a.promotion - b.promotion,
  "Potential": (a: Operator, b: Operator): number => a.potential - b.potential,
  "Favorite": (a: Operator, b: Operator): number => +a.favorite - +b.favorite,
  "Modules": (a: Operator, b: Operator): number => a.module.reduce(r => r + 1, 0) - b.module.reduce(r => r + 1, 0),
}


export enum SELECT_STATE {
  Grid,
  Batch
}
const EditOperator = dynamic(
  () => import("../../components/input/EditOperator"),
  { ssr: false }
);
const OperatorSelector = dynamic(
  () => import("../../components/input/OperatorSelector"),
  { ssr: false }
);
const Input: NextPage = () => {
  const [opId, setOpId] = React.useState("");
  const [editOpen, setEditOpen] = React.useState(false);

  const handleSelectOp = React.useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  const [sortQueue, setSortQueue] = React.useState<SortListItem[]>([]);
  const [presetOpen, setPresetOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchName, setSearchName] = React.useState("");

  /*
   * (key) -> remove this sort from the queue
   * (key, desc) -> add the sort with this sorting
   */
  function toggleSortOrder(key: string, desc?: boolean) {
    const filteredQueue = sortQueue.filter((li: SortListItem) => li.key !== key);
    if (desc !== undefined) {
      setSortQueue(_ => [...filteredQueue, { key: key, desc: desc }]);
    } else {
      setSortQueue(_ => [...filteredQueue]);
    }
  }

  const sortFunction = React.useCallback((a: Operator, b: Operator) => {
    return sortQueue.map(({ key, desc }) => {
      let compareKey = sortFunctions[key as keyof typeof sortFunctions](a, b);
      return desc ? compareKey : -compareKey;
    }).reduce((acc, curr) => {
      return acc || curr;
    }, 0);
  }, [sortQueue])

  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filter, _setFilter] = React.useState<Record<string, Record<string, FilterFunction>>>({});
  const addFilter = useCallback((p: string, k: string, fp: FilterFunction) => {
    const currFilter = { ...filter };
    const propertyFilter = currFilter[p];
    console.log("Adding " + p + "-" + k);
    if (!propertyFilter) {
      currFilter[p] = {};
    }
    // Key doesn't exist, add filter in
    currFilter[p][k] = fp;
    _setFilter(currFilter);
  }, [filter]);
  const removeFilter = useCallback((p: string, k: string) => {
    const currFilter = { ...filter };
    const propertyFilter = currFilter[p];
    console.log("Deleting" + p + "-" + k)
    if (propertyFilter && Object.keys(propertyFilter).includes(k)) {
      // Key exists already, time to remove it
      console.log("Key at " + p + "-" + k + " deleted")
      delete currFilter[p][k];
    } else console.log("Key at " + p + "-" + k + " doesn't exist - could not delete")
    _setFilter(currFilter);
  }, [filter]);

  const filterFunction = (op: OpJsonObj) => {
    const filterFunctions = Object.values(filter)
      .map(v1 => Object.values(v1).some(v2 => v2(op)));
    return filterFunctions.every(v => v)
      && (op.name.toLowerCase().includes(searchName.toLowerCase())
        || op.cnName.toLowerCase().includes(searchName.toLowerCase()));
  }

  const [selectedPreset, setSelectedPreset] = useState("")
  const [selectState, setSelectState] = React.useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([])

  return (
    <Layout tab="/data" page="/input">
      <EditOperator opId={opId} open={editOpen} onClose={() => setEditOpen(false)} />

      <FilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        addFilter={addFilter}
        removeFilter={removeFilter}
      />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} setSearch={setSearchName} />
      <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1 }}>
        <Box sx={{ height: "100%" }}>
          <ButtonGroup
            orientation="vertical"
            sx={{
              position: "sticky",
              top: 64,
              "& .MuiIconButton.root": {
                height: "min-content"
              }
            }}>
            <IconButton onClick={() => setPresetOpen(true)} aria-label="Batch Edit" >
              <FormatPaintOutlined fontSize="large" color="primary" />
            </IconButton>
            <SortDialog sortKeys={Object.keys(sortFunctions)} sortQueue={sortQueue} handleChange={toggleSortOrder} />
            <IconButton onClick={() => setFilterOpen(true)} aria-label="Filter">
              <FilterAltOutlined fontSize="large" color="primary" />
            </IconButton>
            <IconButton onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" >
              <Search fontSize="large" color="primary" />
            </IconButton>
          </ButtonGroup>
        </Box>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          justifyContent: "center",
          gridGap: "0.75rem",
          margin: "0px",
          padding: "0px",
          "& .MuiTypography-root": {
            display: "flex",
            lineHeight: "1.25rem",
            color: "text.primary",
            letterSpacing: "normal",
            textTransform: "none",
            pointerEvents: "none",
            flexDirection: "column",
            mx: "-1rem",
          },
          "& .MuiButton-root": {
            display: "grid",
            boxShadow: 2,
            backgroundColor: "info.main",
            width: "100%",
            height: "min-content",
          },
          "& .unowned": {
            opacity: 0.75
          }
        }}>
          <OperatorSelector
            onClick={handleSelectOp}
            sort={sortFunction}
            filter={filterFunction}
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default Input;