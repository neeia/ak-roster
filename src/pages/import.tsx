import type { NextPage } from "next";
import { Box } from "@mui/material";
import Layout from "components/Layout";
import useAccount from "util/hooks/useAccount";
import dynamic from "next/dynamic";

const GameImport = dynamic(() => import("components/app/GameImport"), { ssr: false });
const Import: NextPage = () => {
  const [account] = useAccount();

  return (
    <Layout tab="" page="/import">
      {!account ? null : (
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
      )}
    </Layout>
  );
};
export default Import;
