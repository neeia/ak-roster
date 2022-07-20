import React, { useState } from "react";
import type { NextPage } from "next";
import { Operator } from "../../types/operator";
import { Box } from "@mui/material";
import OperatorSelector from "../../components/data/OperatorSelector";

export enum SELECT_STATE {
  Grid,
  OpEdit,
  PsEdit,
  Batch
}

const Input: NextPage = () => {
  const [selectedOperator, setSelectedOperator] = React.useState("")
  const [selectedPreset, setSelectedPreset] = useState("")
  const [selectState, setSelectState] = React.useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([])

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
}
export default Input;
