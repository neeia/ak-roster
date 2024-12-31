import React, { useState } from "react";
import type { NextPage } from "next";
import { Box } from "@mui/material";
import Layout from "components/Layout";
import usePresets from "util/hooks/usePresets";
import Chip from "components/base/Chip";
import { Add } from "@mui/icons-material";
import Board from "components/base/Board";
import PresetDialog from "components/data/batch/PresetDialog";
import Preset from "types/operators/presets";

const Presets: NextPage = () => {
  const { presets, addPreset, changePreset, deletePreset } = usePresets();

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const onChange = (preset: Preset) => {
    if (index === presets.length) {
      addPreset(preset);
    } else if (index < presets.length) {
      changePreset(preset);
    }
  };

  return (
    <Layout tab="/data" page="/presets">
      <Board>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            lineHeight: 1,
          }}
        >
          <Chip
            component="button"
            onClick={() => {
              setIndex(presets.length);
              setOpen(true);
            }}
            color="primary"
            icon={<Add fontSize="small" />}
            sx={{ px: 1, "& .MuiChip-label": { px: 1 } }}
          >
            Create New
          </Chip>
          {presets.map((preset) => (
            <Chip
              key={preset.index}
              component="button"
              onClick={() => {
                setIndex(preset.index);
                setOpen(true);
              }}
            >
              {preset.name}
            </Chip>
          ))}
        </Box>
        <PresetDialog
          open={open}
          onClose={() => setOpen(false)}
          preset={presets[index] || { index, name: "" }}
          onSubmit={onChange}
          onDelete={() => deletePreset(index)}
          add={index === presets.length}
        />
      </Board>
    </Layout>
  );
};
export default Presets;
