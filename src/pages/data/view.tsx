import React from "react";
import type { NextPage } from "next";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import { Operator } from "../../types/operator";
import classList from "../../data/classList";

function defaultSort(a: Operator, b: Operator) {
  return (b.owned ? 1 : 0) - (a.owned ? 1 : 0) ||
    b.promotion - a.promotion || b.level - a.level ||
    b.rarity - a.rarity ||
    classList.indexOf(a.class) - classList.indexOf(b.class) ||
    (b.module?.length ?? 0) - (a.module?.length ?? 0) ||
    a.name.localeCompare(b.name)
}

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
        <CollectionContainer sort={defaultSort} />
      </Box>
    </Layout>
  );
}
export default View;