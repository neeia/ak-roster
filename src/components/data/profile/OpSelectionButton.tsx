import React from "react";
import { Box, IconButton } from "@mui/material";
import { Operator } from "../../types/operator";
import { Backspace, PersonAddAlt1 } from "@mui/icons-material";
import Image from "next/image";

function imgUrl(op: Operator) {
  let intermediate = op?.op_id ?? "";
  if (op && op.elite === 2) {
    intermediate += "_2";
  } else if (op && op.elite === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  return `/img/avatars/${op.skin ?? intermediate}.png`;
}

interface Props {
  op: Operator;
  onClick: () => void;
  clear: () => void;
}

const OpSelectionButton = (props: Props) => {
  const { op, onClick, clear } = props;

  return op ? (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        height: "min-content",
      }}
    >
      <Box
        sx={{
          borderRadius: "2px 0px 0px 2px",
          backgroundColor: "info.main",
          gridRow: "span 2",
          position: "relative",
          width: {
            xs: "4rem",
            sm: "6rem",
          },
        }}
      >
        <Image src={imgUrl(op)} layout="fill" alt={op.name} />
      </Box>
      <IconButton
        aria-label="Clear Operator"
        sx={{
          height: {
            xs: "2rem",
            sm: "3rem",
          },
          width: {
            xs: "2.5rem",
            sm: "2.5rem",
          },
          borderRadius: "0px 2px 0px 0px",
        }}
        onClick={clear}
      >
        <Backspace />
      </IconButton>
      <IconButton
        aria-label="Select Operator"
        sx={{
          height: {
            xs: "2rem",
            sm: "3rem",
          },
          width: {
            xs: "2.5rem",
            sm: "2.5rem",
          },
          borderRadius: "0px 0px 2px 0px",
        }}
        onClick={onClick}
      >
        <PersonAddAlt1 />
      </IconButton>
    </Box>
  ) : (
    <IconButton
      aria-label="Select Operator"
      sx={{
        borderRadius: "2px",
        height: {
          xs: "4rem",
          sm: "6rem",
        },
        width: {
          xs: "6.5rem",
          sm: "8.5rem",
        },
      }}
      onClick={onClick}
    >
      <PersonAddAlt1 />
    </IconButton>
  );
};
export default OpSelectionButton;
