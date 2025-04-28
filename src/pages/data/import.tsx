import type { NextPage } from "next";
import { Box } from "@mui/material";
import Layout from "components/Layout";
import dynamic from "next/dynamic";

const GameImport = dynamic(() => import("components/app/GameImport"), { ssr: false });
const Import: NextPage = () => {
  return (
    <Layout tab="/data" page="/import">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, sm: 2 },
          maxWidth: "sm",
          justifySelf: "center",
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "4px",
          },
        }}
      >
        <GameImport />
      </Box>
    </Layout>
  );
};
export default Import;
