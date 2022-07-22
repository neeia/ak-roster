import React, { useState } from "react";
import type { NextPage } from "next";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";

const OperatorSelector = dynamic(
  () => import("../../components/data/OperatorSelector"),
  { ssr: false }
);

export enum SELECT_STATE {
  Grid,
  OpEdit,
  PsEdit,
  Batch
}
const EditOperator = dynamic(
  () => import("../../components/data/EditOperator"),
  { ssr: false }
);
const Input: NextPage = () => {
  const [opId, setOpId] = React.useState("")
  const [selectedPreset, setSelectedPreset] = useState("")
  const [selectState, setSelectState] = React.useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([])

  return (
    <Layout tab="/data" page="/input">
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        justifyContent: "center",
        gridGap: "0.75rem",
        margin: "0px",
        padding: "0px",
      }}>
        <OperatorSelector onClick={setOpId} />
        <EditOperator opId={opId} onClose={() => setOpId("")} />
      </Box>
    </Layout>
  );
}
export default Input;
