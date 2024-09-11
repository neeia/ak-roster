import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup, IconButton, Tooltip, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import { Operator } from "types/operator";
import { ModeEdit } from "@mui/icons-material";
import SortDialog from "components/data/collate/SortDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SearchDialog from "components/data/collate/SearchDialog";
import { useSort, useFilter } from "util/useSSF";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const EditOperator = dynamic(
  () => import("components/data/input/EditOperator"),
  { ssr: false }
);
const CollectionContainer = dynamic(
  () => import("components/data/view/CollectionContainer"),
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
      "owned": { "owned": (op: Operator) => op.potential > 0 }
    });

  const [opId, setOpId] = React.useState<string>();
  const [editOpen, setEditOpen] = React.useState(false);
  const handleSelectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  const db = getDatabase();
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
              xs: 1,
              sm: 0
            },
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
          <Tooltip title="Edit Mode" arrow describeChild>
            <IconButton
              className={editMode ? "selected" : ""}
              onClick={() => setEditMode(!editMode)}
              aria-label="Edit Mode"
              sx={{ display: "flex", flexDirection: "column" }} >
              <ModeEdit fontSize="large" color="primary" />
              <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
                Edit Mode
              </Typography>
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        <Box sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: { xs: "center", sm: "left" },
          gap: "12px 6px",
        }}>
          <CollectionContainer
            sort={sortFunction}
            filter={filterFunction}
            editMode={editMode}
            onClick={handleSelectOp}
          />
          <EditOperator
            opId={opId}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default View;