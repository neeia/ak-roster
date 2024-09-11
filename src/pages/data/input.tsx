import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box, ButtonGroup, IconButton, Typography } from "@mui/material";
import Layout from "components/Layout";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import { useSort, useFilter } from "util/useSSF";
import { Operator, OperatorData, OperatorId } from "types/operator";
import usePresets from "util/usePresets";
import { ArrowBack } from "@mui/icons-material";
import { AccountInfo, isCN } from "types/doctor";
import useLocalStorage from "util/useLocalStorage";
import supabase from "supabase/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { keyframes } from '@mui/system';
import useOperators from "util/useOperators";

const shimmer = keyframes`
  0% {
      background-position: -120px 0;
  }
  100% {
      background-position: 120px 0;
  }
`;

const EditOperator = dynamic(
  () => import("components/data/input/EditOperator"),
  { ssr: false }
);
const OperatorSelector = dynamic(
  () => import("components/data/input/OperatorSelector"),
  { ssr: false }
);

const Input: NextPage = () => {

  const [operators, setOperators] = useOperators();
  const [presets, changePreset, rename] = usePresets();
  const [batch, setBatch] = useState(false);
  const [preset, setPreset] = useState("");

  const [opId, setOpId] = React.useState<OperatorId>("char_002_amiya");
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
    const copyOperators = { ...operators };
    copyOperators[op.op_id] = { ...op };
    if (session) {

    }
    setOperators(copyOperators);
  };

  // const applyBatch = React.useCallback(
  //   (source: Operator, target: string[], safeMode?: boolean) => {
  //     setOperators(
  //       (oldOperators: Record<string, Operator>): Record<string, Operator> => {
  //         const copyOperators = { ...oldOperators };
  //         target.forEach((opID: string) => {
  //           var op = { ...copyOperators[opID] };
  //           var copySource = { ...source }
  //           if (safeMode) {
  //             copySource = safeMerge(source, op);
  //           }

  //           op = changeOwned(op, copySource.potential > 0);
  //           op = changeFavorite(op, copySource.favorite);
  //           op = changePotential(op, copySource.potential);
  //           op = changePromotion(op, copySource.elite);
  //           op = changeLevel(op, copySource.level);
  //           op = changeSkillLevel(op, copySource.rank);
  //           copySource.masteries.forEach((value, index) => {
  //             op = changeMastery(op, index, value);
  //           })

  //           copyOperators[opID] = op;
  //           if (user) {
  //             set(ref(db, `users/${user.uid}/roster/${opID}`), op);
  //           }
  //         })
  //         return copyOperators;
  //       }
  //     );
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [user, setOperators]
  // );
  // const handleCancelBatch = () => {
  //   setBatch(false);
  //   setSelectGroup([]);
  // }
  // const handleApplyBatch = () => {
  //   const presetOp = presets[preset];
  //   setBatch(false);
  //   applyBatch(presetOp, selectGroup);
  //   setSelectGroup([]);
  // }

  const [selectGroup, setSelectGroup] = useState<string[]>([]);
  const toggleOp = useCallback((id: string) => {
    setSelectGroup((old) => {
      return old.includes(id) ?
        old.filter((li) => li !== id) : [...old, id]
    });
  }, [])
  const selectOp = useCallback((id: OperatorId) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  const handleSelectOp = useCallback((id: OperatorId) => {
    // const toggleOp, const selectOp...
    return batch ? toggleOp(id) : selectOp(id);
  }, [batch, toggleOp, selectOp]);

  // const [editPresetOpen, setEditPresetOpen] = useState(false);
  return (
    <Layout
      tab="/data"
      page="/input"
      header={batch
        ? <>
          <IconButton
            aria-label="Cancel batch"
            edge="start"
            onClick={() => setBatch(false)}
          >
            <ArrowBack sx={{ color: "background.paper" }} />
          </IconButton>
          <Typography variant="h5" sx={{ lineHeight: "1rem", mr: 1.5 }}>
            Applying: {presets[preset].name}
          </Typography>
        </>
        : null
      }
    >
      <Box sx={{
        display: "grid",
        gridTemplateAreas: { xs: `"ctrl" "box"`, sm: `"ctrl box"` },
        gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
        gap: 2
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
          {/* <BatchDialog
            preset={preset}
            editOpen={() => setEditPresetOpen(true)}
            selectPreset={setPreset}
            applyPreset={() => setBatch(true)}
          /> */}
          {/* TODO: Put presets back in */}
          {/* <EditPreset
            open={editPresetOpen}
            onClose={() => setEditPresetOpen(false)}
            preset={presets[preset]}
            onChange={changePreset}
            rename={rename}
          /> */}
          {/* {batch
            ? <>
              <Divider sx={{ display: { xs: "none", sm: "inherit" } }} />
              <Typography
                component="span"
                variant="caption"
                sx={{
                  marginBottom: -1,
                  width: "min-content",
                  height: "min-content",
                  margin: "auto"
                }}
              >
                Apply
              </Typography>
              <IconButton onClick={handleApplyBatch} aria-label="Apply batch">
                <Check color="success" />
              </IconButton>
              <IconButton onClick={handleCancelBatch} aria-label="Cancel batch">
                <Clear color="error" />
              </IconButton>
            </>
            : null
          } */}
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
          "& > .loading button": {
            background: "linear-gradient(95deg, #333 8%, #3a3a3a 44%, #333 80%)",
            backgroundSize: "120px 100%",
            animation: `${shimmer} 2s infinite linear`,
            "& *": {
              opacity: "0",
            },
          }
        }}>
          <OperatorSelector
            operators={operators ?? {}}
            onClick={handleSelectOp}
            sort={sortFunction}
            filter={filterFunction}
            toggleGroup={batch ? selectGroup : undefined}
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