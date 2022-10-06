import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box, ButtonGroup } from "@mui/material";
import Layout from "components/Layout";
import SearchDialog from "components/collate/SearchDialog";
import FilterDialog from "components/collate/FilterDialog";
import SortDialog from "components/collate/SortDialog";
import { useSort, useFilter } from "util/useSSF";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { Operator } from "types/operator";
import useOperators from "util/useOperators";

const EditOperator = dynamic(
  () => import("components/input/EditOperator"),
  { ssr: false }
);
const OperatorSelector = dynamic(
  () => import("components/input/OperatorSelector"),
  { ssr: false }
);
const Input: NextPage = () => {

  const [operators, setOperators] = useOperators();

  const [opId, setOpId] = React.useState("");
  const [editOpen, setEditOpen] = React.useState(false);
  const handleSelectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] = useSort([
    { key: "Rarity", desc: true },
  ]);
  const [, setSearchName, filter, addFilter, removeFilter, clearFilters, filterFunction] = useFilter();

  const db = getDatabase();
  const onChange = (op: Operator) => {
    const copyOperators = { ...operators };
    copyOperators[op.id] = { ...op };
    if (user) {
      set(ref(db, `users/${user.uid}/roster/${op.id}`), op);
    }
    setOperators(copyOperators);
  };
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <Layout
      tab="/data"
      page="/input"
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
          "& .hidden": {
            display: "none"
          },
        }}>
          <OperatorSelector
            operators={operators}
            onClick={handleSelectOp}
            sort={sortFunction}
            filter={filterFunction}
          />
          <EditOperator
            onChange={onChange}
            op={operators[opId]}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default Input;