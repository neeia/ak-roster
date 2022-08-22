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
    <Layout tab="/account" page="/profile">
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px 6px",
      }}>
        <TextField
          id="filled-helperText"
          label="Helper text"
          defaultValue="Default Value"
          helperText="Some important text"
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="Helper text"
          defaultValue="Default Value"
          helperText="Some important text"
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="Helper text"
          defaultValue="Default Value"
          helperText="Some important text"
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="Helper text"
          defaultValue="Default Value"
          helperText="Some important text"
          variant="filled"
        />
      </Box>
    </Layout>
  );
}
export default View;