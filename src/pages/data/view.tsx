import React from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup, IconButton } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import { Operator } from "../../types/operator";
import { ModeEdit } from "@mui/icons-material";
import SortDialog from "../../components/collate/SortDialog";
import FilterDialog from "../../components/collate/FilterDialog";
import SearchDialog from "../../components/collate/SearchDialog";
import useOperators from "../../util/useOperators";
import { useSort, useFilter } from "../../util/useSSF";

const CollectionContainer = dynamic(
  () => import("../../components/view/CollectionContainer"),
  { ssr: false }
);
const View: NextPage = () => {
  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] = useSort([
    { key: "Level", desc: true },
    { key: "Rarity", desc: true },
  ]);
  const [, setSearchName, filter, addFilter, removeFilter, clearFilters, filterFunction] = useFilter(
    {
      "owned": { "owned": (op: Operator) => op.owned }
    });

  const [operators] = useOperators();

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
          <IconButton onClick={() => { }} aria-label="Edit" >
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
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default View;