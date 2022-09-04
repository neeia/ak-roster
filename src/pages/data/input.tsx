import React, { useState } from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup, IconButton } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import { FormatPaintOutlined } from "@mui/icons-material";
import SearchDialog from "../../components/collate/SearchDialog";
import FilterDialog from "../../components/collate/FilterDialog";
import SortDialog from "../../components/collate/SortDialog";
import HelpDialog from "../../components/input/HelpDialog";
import useSSF from "../../util/useSSF";

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

  const [, setSearchName,
    sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction,
    filter, addFilter, removeFilter, clearFilters, filterFunction] = useSSF([
      { key: "Rarity", desc: true },
    ]);

  const [presetOpen, setPresetOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [selectState, setSelectState] = useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([]);

  return (
    <Layout tab="/data" page="/input">
      <Box sx={{
        display: "grid",
        gridTemplateAreas: { xs: `"ctrl" "box"`, sm: `"ctrl box"` },
        gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
        gap: 2
      }}>
        <ButtonGroup sx={{
          gridArea: "ctrl",
          flexDirection: { xs: "row", sm: "column" },
          position: "sticky",
          top: 64,
          zIndex: 10,
          gap: 1,
          "& .MuiIconButton-root": {
            height: "min-content",
          },
          "& .MuiSvgIcon-root": {
            height: { xs: "1.5rem", sm: "2.5rem" },
          },
          justifyContent: "space-around",
          height: "min-content",
          backgroundColor: { xs: "info.main", sm: "transparent" },
          boxShadow: {
            xs: 5,
            sm: 0
          },
        }}>
          <IconButton onClick={() => setPresetOpen(true)} aria-label="Batch Edit" >
            <FormatPaintOutlined fontSize="large" color="primary" />
          </IconButton>
          <SortDialog
            sortFns={sortFunctions}
            sortQueue={sortQueue}
            setSortQueue={setSortQueue}
            toggleSort={toggleSort}
          />
          <FilterDialog
            filter={filter}
            addFilter={addFilter}
            removeFilter={removeFilter}
            clearFilters={clearFilters}
          />
          <SearchDialog setSearch={setSearchName} />
          <HelpDialog />
        </ButtonGroup>
        <Box sx={{
          display: "grid",
          gridArea: "box",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gridTemplateRows: "min-content",
          justifyContent: "center",
          gap: { xs: 0.5, sm: 1 },
          margin: 0,
          padding: 0,
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
            backgroundColor: { xs: "info.dark", sm: "info.main" },
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
          <EditOperator opId={opId} open={editOpen} onClose={() => setEditOpen(false)} />
        </Box>
      </Box>
    </Layout>
  );
}
export default Input;