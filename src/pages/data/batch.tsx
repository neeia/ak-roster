import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, ButtonGroup, FormControlLabel, IconButton, Switch, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import PopOp from "../../components/profile/PopOp";
import { useFilter, useSort } from "../../util/useSSF";
import { Operator, OpJsonObj } from "../../types/operator";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";

const EditPreset = dynamic(
  () => import("../../components/batch/EditPreset"),
  { ssr: false }
);
const PresetSelector = dynamic(
  () => import("../../components/batch/PresetSelector"),
  { ssr: false }
);
const Batch: NextPage = () => {
  const [preset, setPreset] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectGroup, setSelectGroup] = useState<string[]>([]);
  const toggleOp = (id: string) => {
    const filteredQueue = selectGroup.filter(li => li !== id);
    setSelectGroup(_ => selectGroup.includes(id) ? [...filteredQueue] : [...filteredQueue, id]);
  }

  const handleEditPreset = (id: string) => {
    setPreset(id);
    setEditOpen(true);
  };
  const handleApplyPreset = (id: string) => {
    setPreset(id);
    setApplyOpen(true);
  };

  const [safeMode, setSafeMode] = useState<boolean>(true);
  const toggleSafeMode = () => {
    setSafeMode(!safeMode)
  }

  const [isCN, setIsCN] = useState(false);
  const filter = isCN ? undefined : (opInfo: OpJsonObj) => !opInfo.isCnOnly;
  const sort = (a: Operator, b: Operator) => b.rarity - a.rarity;

  const [doctor] = useLocalStorage<AccountInfo>("doctor", {});
  useEffect(() => {
    setIsCN(doctor.server === "CN");
  }, [doctor.server]);


  return (
    <Layout
      tab="/data"
      page="/batch"
    >
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px 6px",
        maxWidth: "sm",
      }}>
        Edit Presets
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
            color: "text.primary",
            letterSpacing: "normal",
            textTransform: "none",
            pointerEvents: "none",
          },
          "& .MuiButton-root": {
            boxShadow: 2,
            backgroundColor: { xs: "info.dark", sm: "info.main" },
            height: "100%",
            width: "100%"
          },
        }}>
          <PresetSelector onClick={handleEditPreset} />
          <EditPreset open={editOpen} onClose={() => setEditOpen(false)} presetID={preset} />
        </Box>
        Apply Presets
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
            color: "text.primary",
            letterSpacing: "normal",
            textTransform: "none",
            pointerEvents: "none",
          },
          "& .MuiButton-root": {
            boxShadow: 2,
            backgroundColor: { xs: "info.dark", sm: "info.main" },
            height: "100%",
            width: "100%"
          },
        }}>
          <PresetSelector onClick={handleApplyPreset} />
          <PopOp
            title={selectGroup?.length ? `${selectGroup.length} selected` : "Apply to..."}
            open={applyOpen}
            onClose={() => { setApplyOpen(false); }}
            onClick={toggleOp}
            filter={filter}
            sort={sort}
            toggleGroup={selectGroup}
            sticky
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={safeMode}
                  onChange={toggleSafeMode}
                />
              }
              label="Prevent Downgrades"
              sx={{ marginLeft: 1, marginRight: "auto" }}
            />
            <Button>
              Cancel
            </Button>
            <Button>
              Confirm
            </Button>
          </PopOp>
        </Box>
      </Box>
    </Layout>
  );
}
export default Batch;