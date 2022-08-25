import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Operator } from "../../types/operator";
import { Backspace, Favorite, PersonAddAlt1 } from "@mui/icons-material";
import { rarityColors } from "../../styles/rarityColors";
import { getNumSkills, MAX_LEVEL_BY_RARITY } from "../../util/changeOperator";

function imgUrl(op: Operator) {
  let intermediate = op?.id ?? "";
  if (op && op.promotion === 2) {
    intermediate += "_2";
  } else if (op && op.promotion === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  return `/img/avatars/${intermediate}.png`;
}

interface Props {
  op: Operator;
  onClick: () => void;
  clear: () => void;
}

const OpSelectionButton = React.memo((props: Props) => {
  const { op, onClick, clear } = props;

  return (op
    ? <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", height: "min-content" }}>
      <Box
        component="img"
        sx={{
          borderRadius: "2px 0px 0px 2px",
          backgroundColor: "info.main",
          gridRow: "span 2",
          width: {
            xs: "4rem",
            sm: "6rem"
          }
        }}
        src={imgUrl(op)}
        alt=""
      />
      <IconButton
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
        sx={{
          height: {
            xs: "2rem",
            sm: "3rem"
          },
          width: {
            xs: "2.5rem",
            sm: "2.5rem"
          },
          borderRadius: "0px 0px 2px 0px",
        }}
        onClick={onClick}
      >
        <PersonAddAlt1 />
      </IconButton>
    </Box >
    : <IconButton
      sx={{
        borderRadius: "2px",
        height: {
          xs: "4rem",
          sm: "6rem"
        },
        width: {
          xs: "6.5rem",
          sm: "8.5rem"
        },
      }}
      onClick={onClick}>
      <PersonAddAlt1 />
    </IconButton>
  );
});
export default OpSelectionButton;
