import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box, Button, Typography } from "@mui/material";
import operatorJson from "../../data/operators.json";
import { isUndefined } from "util";
import usePresets from "../../util/usePresets";

interface Props {
  onClick: (opId: string) => void;
}

const PresetSelector = (props: Props) => {
  const { onClick } = props;

  const [presets] = usePresets();

  // Operator Selector Component
  return (
    <Box component="ol" sx={{
      display: "contents",
    }}>
      {Object.values(presets)
        .map((preset: Operator) => {
          return <Box
            component="li"
            key={preset.id}
            sx={{
              listStyleType: "none",
            }}>
            <Button
              className={preset.owned ? "" : "unowned"}
              onClick={() => {
                onClick(preset.id);
              }}>
              <Typography
                component="div"
                variant="caption"
              >
                {preset.name}
              </Typography>
            </Button>
          </Box>
        })
      }
    </Box>)
}
export default PresetSelector;
