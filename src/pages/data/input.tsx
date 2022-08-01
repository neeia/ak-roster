import React, { useState } from "react";
import type { NextPage } from "next";
import { Box, Button, ButtonGroup, Dialog, FormControl, IconButton, InputAdornment, TextField } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import FilterDialog from "../../components/input/FilterDialog";
import { Operator, OpJsonObj } from "../../types/operator";
import { isUndefined } from "util";
import { FilterAltOutlined, FormatPaintOutlined, Search, Send, Tune } from "@mui/icons-material";
import SearchDialog from "../../components/input/SearchDialog";
import SortDialog from "../../components/input/SortDialog";

const OperatorSelector = dynamic(
  () => import("../../components/input/OperatorSelector"),
  { ssr: false }
);

export interface SortListItem {
  key: string;
  desc: boolean;
  value: (a: Operator, b: Operator) => number;
}

interface FilterListItem {
  key: string;
  value: (op: OpJsonObj) => boolean;
}

export enum SELECT_STATE {
  Grid,
  Batch
}
const EditOperator = dynamic(
  () => import("../../components/input/EditOperator"),
  { ssr: false }
);
const Input: NextPage = () => {
  const [opId, setOpId] = React.useState("")
  const [sortQueue, setSortQueue] = React.useState<SortListItem[]>([]);
  const [presetOpen, setPresetOpen] = React.useState(false)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchName, setSearchName] = React.useState("")

  /*
   * (key) -> remove this sort from the queue
   * (key, value) -> add this sort to the queue, descending
   * (key, desc) -> change the sort mode for this sorting
   * (key, value, desc) -> this should never happen
   */
  function toggleSortOrder(key: string, value?: (a: Operator, b: Operator) => number, desc?: boolean) {
    const origValue = sortQueue.filter((li: SortListItem) => li.key === key);
    const filteredQueue = sortQueue.filter((li: SortListItem) => li.key !== key);
    if (value) {
      setSortQueue(_ => [...filteredQueue, { key: key, desc: desc ?? true, value: value }]);
    } else if (desc !== undefined && origValue.length > 0) {
      const orig = origValue[0];
      setSortQueue(_ => [...filteredQueue, { key: key, desc: desc, value: orig.value }]);
    } else {
      setSortQueue(_ => [...filteredQueue]);
    }
  }

  const [selectedPreset, setSelectedPreset] = useState("")
  const [selectState, setSelectState] = React.useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([])

  return (
    <Layout tab="/data" page="/input">
      <EditOperator opId={opId} onClose={() => setOpId("")} />
      <FilterDialog title="Presets" open={presetOpen} onClose={() => setPresetOpen(false)}>
        <Box>

        </Box>
      </FilterDialog>
      <FilterDialog title="Filter" open={filterOpen} onClose={() => setFilterOpen(false)}>
      </FilterDialog>
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
            <SortDialog sortQueue={sortQueue} handleChange={toggleSortOrder} />
            <IconButton onClick={() => setPresetOpen(true)} >
              <FormatPaintOutlined fontSize="large" color="primary" />
            </IconButton>
            <IconButton onClick={() => setFilterOpen(true)} >
              <FilterAltOutlined fontSize="large" color="primary" />
            </IconButton>
            <IconButton onClick={() => setSearchOpen(!searchOpen)} >
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
          }
        }}>
          <OperatorSelector
            onClick={setOpId}
            sort={(a: Operator, b: Operator) => {
              const func = sortQueue.find((f: SortListItem) => f.value(a, b) !== 0);
              return func ? func.value(a, b) * (+func.desc * 2 - 1) : 0
            }}
            filter={(op: OpJsonObj) => {
              return op.name.toLowerCase().includes(searchName.toLowerCase()) || op.cnName.toLowerCase().includes(searchName.toLowerCase());
            }}
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default Input;