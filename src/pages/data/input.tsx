import React, { useState } from "react";
import { Operator } from "../../types/operator";
import { Box } from "@mui/material";
import OperatorSelector from "../../components/data/OperatorSelector";

interface Props {
  operators: Record<string, Operator>;
  changeOperators: (
    operatorID: string,
    property: string,
    value: number | boolean,
    index?: number
  ) => void;
  presets: Record<string, Operator>;
  changePresets: (
    presetID: string,
    property: string,
    value: number | boolean
  ) => void;
  applyBatch: (source: Operator, target: string[]) => void;
}


export enum SELECT_STATE {
  Grid,
  OpEdit,
  PsEdit,
  Batch
}

export const COLOR_BY_RARITY = ["#000000", "#9f9f9f", "#dce537", "#00b2f6", "#dbb1db", "#fbae02", "#f96601"]


const DataTab = React.memo((props: Props) => {
  const [selectedOperator, setSelectedOperator] = React.useState("")
  const [selectedPreset, setSelectedPreset] = useState("")
  const [selectState, setSelectState] = React.useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([])

  const editSelectionGrid =
    <OperatorSelector
      onClick={(op: Operator) => {
        setSelectedOperator(op.id);
        setSelectState(SELECT_STATE.OpEdit)
      }}
    />

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
    }}>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "calc(2.5% + 4px)",
        paddingTop: "calc(1.5% + 4px)",
      }}>
      </Box>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, 78px)",
        justifyContent: "center",
        gridGap: "3px",
        margin: "0px",
        padding: "0px",
      }}>
        <OperatorSelector
          onClick={(op: Operator) => {
            setSelectedOperator(op.id);
            setSelectState(SELECT_STATE.OpEdit)
          }}
        />
      </Box>
    </Box>
  );
});
export default DataTab;
