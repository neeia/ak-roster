import React, { useCallback, useEffect } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box, ButtonGroup } from "@mui/material";
import Layout from "components/Layout";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import useSort from "util/hooks/useSort";
import useFilter from "util/hooks/useFilter";
import { Operator, OperatorData, OpInfo } from "types/operator";
import { AccountInfo, isCN } from "types/doctor";
import useLocalStorage from "util/hooks/useLocalStorage";
import { useRosterGetQuery } from "store/extendRoster";

const EditOperator = dynamic(
  () => import("components/data/input/EditOperator"),
  { ssr: false }
);
const OperatorSelector = dynamic(
  () => import("components/data/input/OperatorSelector"),
  { ssr: false }
);

const Input: NextPage = () => {

  const [opId, setOpId] = React.useState<string>("char_002_amiya");
  const [editOpen, setEditOpen] = React.useState(false);

  const { sorts, setSorts, toggleSort, sortFunction, sortFunctions } = useSort([
    { key: "Rarity", desc: true },
  ]);
  const { filters, toggleFilter, clearFilters, filterFunction } = useFilter();

  const [doctor] = useLocalStorage<AccountInfo>("doctor", {});
  useEffect(() => {
    if (!(doctor && doctor.server && isCN(doctor.server)))
      toggleFilter("CN", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  return (
    <Layout tab="/data" page="/input">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <ButtonGroup
          sx={{
            gridArea: "ctrl",
            display: "grid",
            gridTemplateRows: { xs: "1fr auto", sm: "repeat(6, auto)" },
            gridTemplateColumns: { xs: "repeat(4, auto)", sm: "1fr" },
            position: "sticky",
            top: 64,
            zIndex: 10,
            gap: { xs: 0, sm: 1 },
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
              xs: 1,
              sm: 0,
            },
            "& .Mui-disabled": {
              opacity: 0.5,
            },
            "& .selected": {
              backgroundColor: "rgba(255, 255, 255, 0.25)",
            },
          }}
        >
          <SortDialog
            sortFns={sortFunctions}
            sortQueue={sorts}
            setSortQueue={setSorts}
            toggleSort={toggleSort}
          />
          <FilterDialog
            filter={filters}
            toggleFilter={toggleFilter}
            clearFilters={clearFilters}
          />
          {/* <SearchDialog setSearch={setSearchName} /> */}
        </ButtonGroup>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridArea: "box",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gridTemplateRows: "min-content",
            justifyContent: "center",
            gap: { xs: 0.5, sm: 1 },
            margin: 0,
            padding: 0,
            "& .unowned": {
              opacity: 0.75,
            },
            "& .hidden": {
              display: "none",
            },
          }}
        >
          <OperatorSelector
            onClick={selectOp}
            sort={sortFunction}
            filter={filterFunction}
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
};
export default Input;
