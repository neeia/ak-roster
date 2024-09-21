import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box, ButtonGroup, IconButton, Skeleton, Typography } from "@mui/material";
import Layout from "components/Layout";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import { useSort, useFilter } from "util/useSSF";
import { Operator, OperatorData } from "types/operator";
import usePresets from "util/usePresets";
import { ArrowBack } from "@mui/icons-material";
import { AccountInfo, isCN } from "types/doctor";
import useLocalStorage from "util/useLocalStorage";
import supabase from "supabase/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { keyframes } from '@mui/system';
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

  const { data: operators } = useRosterGetQuery();

  const [presets, changePreset, rename] = usePresets();
  const [batch, setBatch] = useState(false);
  const [preset, setPreset] = useState("");

  const [opId, setOpId] = React.useState<string>("char_002_amiya");
  const [editOpen, setEditOpen] = React.useState(false);

  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] = useSort([
    { key: "Rarity", desc: true },
  ]);
  const [, setSearchName, filter, addFilter, removeFilter, clearFilters, filterFunction] = useFilter();

  const [doctor] = useLocalStorage<AccountInfo>("doctor", {});
  useEffect(() => {
    const filterKey = "cn";
    if (!(doctor && doctor.server && isCN(doctor.server))) addFilter(filterKey, "EN", (_, opInfo: OperatorData) => !opInfo.isCnOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  const onChange = (op: Operator) => {

  };

  const selectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);


  // const [editPresetOpen, setEditPresetOpen] = useState(false);
  return (
    <Layout tab="/data" page="/input">
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}>
        <ButtonGroup sx={{
          gridArea: "ctrl",
          display: "grid",
          gridTemplateRows: { xs: "1fr auto", sm: "repeat(6, auto)" },
          gridTemplateColumns: { xs: "repeat(4, auto)", sm: "1fr", },
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
            sm: 0
          },
          "& .Mui-disabled": {
            opacity: 0.5,
          },
          "& .selected": {
            backgroundColor: "rgba(255, 255, 255, 0.25)"
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
          {batch
            ? <Box sx={{
              display: { xs: "none", sm: "inherit" },
              position: "absolute",
              gridArea: "4 / 1 / span 5 / 1",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "2rem",
              boxShadow: 1,
            }}>
            </Box>
            : null
          }
          <SearchDialog setSearch={setSearchName} />
        </ButtonGroup>
        <Box sx={{
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
            opacity: 0.75
          },
          "& .hidden": {
            display: "none"
          },
          "& .untoggled": {
            opacity: 0.5
          },
          "& .toggled": {
            opacity: 1,
          },
        }}>

          <OperatorSelector
            operators={operators ?? {}}
            onClick={selectOp}
            sort={sortFunction}
            filter={filterFunction}
          />
          <EditOperator
            op={operators[opId]}
            changeOperator={onChange}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />
        </Box>
      </Box>
    </Layout>
  );
}
export default Input;