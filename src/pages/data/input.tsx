import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import SearchDialog from "../../components/collate/SearchDialog";
import FilterDialog from "../../components/collate/FilterDialog";
import SortDialog from "../../components/collate/SortDialog";
import { useSort, useFilter } from "../../util/useSSF";
import useOperators from "../../util/useOperators";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getUserStatus } from "../../util/getUserStatus";
import { safeSyncAll } from "../../util/useSync";

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

  const handleSelectOp = (id: string) => {
    setOpId(id);
    setEditOpen(true);
  };

  const [operators, onChange, , setOperators] = useOperators();
  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] = useSort([
    { key: "Rarity", desc: true },
  ]);
  const [, setSearchName, filter, addFilter, removeFilter, clearFilters, filterFunction] = useFilter();

  return (
    <Layout
      tab="/data"
      page="/input"
      onLogin={(user: User) => { safeSyncAll(user, operators, setOperators) }}
    >
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
          "& .Mui-disabled": {
            opacity: 0.5,
          }
        }}>
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
            ":hover": { brightness: 1.1 }
          },
          "& .unowned": {
            opacity: 0.75
          },
        }}>
          <OperatorSelector
            operators={operators}
            onClick={handleSelectOp}
            sort={sortFunction}
            filter={filterFunction}
          />
          <EditOperator
            operators={operators}
            onChange={onChange}
            opId={opId}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default Input;