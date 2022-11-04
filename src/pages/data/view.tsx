import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup, IconButton } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import { Operator } from "types/operator";
import { ModeEdit } from "@mui/icons-material";
import SortDialog from "components/collate/SortDialog";
import FilterDialog from "components/collate/FilterDialog";
import SearchDialog from "components/collate/SearchDialog";
import useOperators from "util/useOperators";
import { useSort, useFilter } from "util/useSSF";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const EditOperator = dynamic(
  () => import("components/input/EditOperator"),
  { ssr: false }
);
const CollectionContainer = dynamic(
  () => import("../../components/view/CollectionContainer"),
  { ssr: false }
);
const View: NextPage = () => {
  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] = useSort([
    { key: "Favorite", desc: true },
    { key: "Level", desc: true },
    { key: "Rarity", desc: true },
  ]);
  const [, setSearchName, filter, addFilter, removeFilter, clearFilters, filterFunction] = useFilter(
    {
      "owned": { "owned": (op: Operator) => op.owned }
    });

  const [opId, setOpId] = React.useState("");
  const [editOpen, setEditOpen] = React.useState(false);
  const handleSelectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  const [operators, setOperators] = useOperators();
  const db = getDatabase();
  const onChange = (op: Operator) => {
    const copyOperators = { ...operators };
    copyOperators[op.id] = { ...op };
    if (user) {
      set(ref(db, `users/${user.uid}/roster/${op.id}`), op);
    }
    setOperators(copyOperators);
  };
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);


  return (
    <Layout tab="/data" page="/view">
      <Box sx={{
        display: "grid",
        gridTemplateAreas: { xs: `"ctrl" "box"`, sm: `"ctrl box"` },
        gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
        gap: 2
      }}>
        <ButtonGroup
          sx={{
            gridArea: "ctrl",
            flexDirection: { xs: "row", sm: "column" },
            position: "sticky",
            top: 64,
            zIndex: 10,
            gap: 1,
            "& .MuiIconButton-root": {
              height: "min-content",
              borderRadius: "4px",
            },
            "& .MuiSvgIcon-root": {
              height: { xs: "1.5rem", sm: "2.5rem" },
              width: { xs: "1.5rem", sm: "2.5rem" },
            },
            "& .selected": {
              backgroundColor: "rgba(255, 255, 255, 0.15)"
            },
            justifyContent: "space-around",
            height: "min-content",
            backgroundColor: { xs: "info.main", sm: "transparent" },
            boxShadow: {
              xs: 5,
              sm: 0
            },
          }}>
          <IconButton className={editMode ? "selected" : ""} onClick={() => setEditMode(!editMode)} aria-label="Edit" >
            <ModeEdit fontSize="large" color="primary" />
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
        </ButtonGroup>
        <Box sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: { xs: "center", sm: "left" },
          gap: "12px 6px",
        }}>
          <CollectionContainer
            operators={operators}
            sort={sortFunction}
            filter={filterFunction}
            editMode={editMode}
            onClick={handleSelectOp}
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
export default View;