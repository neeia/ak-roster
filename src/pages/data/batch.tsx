import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, FormControlLabel, Switch } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import PopOp from "../../components/profile/PopOp";
import { Operator, OpJsonObj } from "../../types/operator";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import { Edit, FormatPaint } from "@mui/icons-material";
import useOperators from "../../util/useOperators";
import usePresets from "../../util/usePresets";

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

  const handleSelectPreset = (id: string) => {
    setPreset(id);
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

  const [presets] = usePresets();
  const [operators, , applyBatch] = useOperators();
  const handleApplyBatch = () => {
    const presetOp = presets[preset];
    applyBatch(presetOp, selectGroup, safeMode);
    setSelectGroup([]);
    setApplyOpen(false);
  }

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
        Select Preset
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
          "& .selected": {
            opacity: 1,
            boxShadow: 0,
            borderBottomWidth: "0.25rem",
            borderBottomColor: "primary.main",
            borderBottomStyle: "solid",
            backgroundColor: "info.light",
          },
          "& .unselected": {
            opacity: 0.75,
          },
        }}>
          <PresetSelector onClick={handleSelectPreset} selectedPreset={preset} />
        </Box>
        <Box sx={{
          display: "grid",
          gridArea: "box",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gridTemplateRows: "min-content",
          justifyContent: "center",
          gap: { xs: 0.5, sm: 1 },
          margin: 0,
          padding: 0,
          "& .MuiButton-root": {
            display: "flex",
            flexDirection: "column",
            padding: 1,
            boxShadow: 2,
            backgroundColor: { xs: "info.dark", sm: "info.main" },
            height: "100%",
            width: "100%"
          },
        }}>
          <Button disabled={!preset} onClick={() => setEditOpen(true)}>
            <Edit fontSize="large" />
            Edit
          </Button>
          <Button disabled={!preset} onClick={() => setApplyOpen(true)}>
            <FormatPaint fontSize="large" />
            Apply
          </Button>
          <EditPreset open={editOpen} onClose={() => setEditOpen(false)} presetID={preset} />
          <PopOp
            operators={operators}
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
            <Button onClick={() => { setApplyOpen(false); setSelectGroup([]); }}>
              Cancel
            </Button>
            <Button onClick={handleApplyBatch}>
              Confirm
            </Button>
          </PopOp>
        </Box>
      </Box>
    </Layout>
  );
}
export default Batch;