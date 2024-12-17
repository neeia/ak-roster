import React, { useCallback, useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box, ButtonGroup, IconButton, Tooltip, Typography } from "@mui/material";
import Layout from "components/Layout";
import { ModeEdit } from "@mui/icons-material";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import useSort from "util/hooks/useSort";
import useFilter from "util/hooks/useFilter";
import useOperators from "util/hooks/useOperators";
import { defaultOperatorObject } from "util/changeOperator";

const EditOperator = dynamic(() => import("components/data/input/EditOperator"), { ssr: false });
const CollectionContainer = dynamic(() => import("components/data/view/CollectionContainer"), { ssr: false });
const View: NextPage = () => {
  const [roster, , onChange] = useOperators();
  const [opId, setOpId] = useState("char_002_amiya");
  const [editOpen, setEditOpen] = useState(false);

  const { sorts, setSorts, toggleSort, sortFunction, sortFunctions } = useSort([
    { key: "Favorite", desc: true },
    { key: "Level", desc: true },
    { key: "Rarity", desc: true },
  ]);
  const { filters, toggleFilter, clearFilters, filterFunction, setSearch } = useFilter({
    OWNED: new Set([true]),
  });

  const handleSelectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  const [editMode, setEditMode] = useState(false);

  return (
    <Layout tab="/data" page="/view">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <ButtonGroup
          sx={{
            display: "grid",
            gridTemplateRows: { xs: "1fr", sm: "repeat(4, auto)" },
            gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "1fr" },
            position: "sticky",
            top: 64,
            zIndex: 10,
            gap: 1,
            p: 1,
            "& .MuiIconButton-root": {
              aspectRatio: { sm: "1 / 1" },
              borderRadius: "4px",
              p: "4px",
            },
            "& .MuiSvgIcon-root": {
              height: { xs: "1.5rem", sm: "2.5rem" },
            },
            height: "min-content",
            backgroundColor: { xs: "background.light", sm: "background.paper" },
            boxShadow: {
              xs: 1,
              sm: 0,
            },
          }}
        >
          <SortDialog sortFns={sortFunctions} sortQueue={sorts} setSortQueue={setSorts} toggleSort={toggleSort} />
          <FilterDialog filter={filters} toggleFilter={toggleFilter} clearFilters={clearFilters} />
          <SearchDialog onChange={setSearch} />
          <Tooltip title="Edit Mode" arrow describeChild>
            <IconButton
              className={editMode ? "selected" : ""}
              onClick={() => setEditMode(!editMode)}
              aria-label="Edit Mode"
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <ModeEdit fontSize="large" color="primary" />
              <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
                Edit
              </Typography>
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "left" },
            gap: "8px 16px",
            "& .unowned": {
              opacity: 0.75,
            },
            "& .unowned img": {
              opacity: 0.5,
            },
            "& .hidden": {
              display: "none",
            },
          }}
        >
          <CollectionContainer
            roster={roster}
            sort={sortFunction}
            filter={filterFunction}
            editMode={editMode}
            onClick={handleSelectOp}
          />
          <EditOperator
            op={roster[opId] ?? defaultOperatorObject(opId)}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onChange={onChange}
          />
        </Box>
      </Box>
    </Layout>
  );
};
export default View;
