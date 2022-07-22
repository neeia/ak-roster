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
const Lookup: NextPage = () => {
  const [opId, setOpId] = React.useState("")
  const [selectedPreset, setSelectedPreset] = useState("")
  const [selectState, setSelectState] = React.useState(SELECT_STATE.Grid);
  const [selectBatchOps, setSelectBatchOps] = useState<string[]>([])

  return (
    <Layout tab="/network" page="/lookup">
      <Box>
        Look for someone.
      </Box>
    </Layout>
  );
}
export default Lookup;
