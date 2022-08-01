import React, { useState } from "react";
import type { NextPage } from "next";
import { Box, Button, ButtonGroup, Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import { Operator, OpJsonObj } from "../../types/operator";

const CollectionContainer = dynamic(
  () => import("../../components/view/CollectionContainer"),
  { ssr: false }
);
const View: NextPage = () => {

  return (
    <Layout tab="/data" page="/view">
      <Box sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "12px 6px",
      }}>
        <CollectionContainer />
      </Box>
    </Layout>
  );
}
export default View;