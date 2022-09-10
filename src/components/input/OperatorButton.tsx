import React from "react";
import { Operator } from "../../types/operator";
import { Box, Button, Typography } from "@mui/material";
import { rarityColors } from "../../styles/rarityColors";
import { Favorite } from "@mui/icons-material";
import getTextWidth from "../../styles/getTextWidth";
import appTheme from "../../styles/theme/appTheme";

const WIDTH_TO_PX = 10 / 7;
const LONG_CUTOFF = 75;
const LONGER_CUTOFF = 95;

interface Props {
  op: Operator;
  onClick: (opId: string) => void;
}

const OperatorButton = React.memo((props: Props) => {
  const { op, onClick } = props;

  const [n, t] = op.name.split(" the ");
  const name = t ?? n;
  const width = getTextWidth(name, JSON.stringify(appTheme.typography.caption).replace(/[\{\}]+/g, "")) * WIDTH_TO_PX;

  const nameComponent =
    <Typography
      component="div"
      variant={width > LONG_CUTOFF ? width > LONGER_CUTOFF ? "caption3" : "caption2" : "caption"}
    >
      {width > LONGER_CUTOFF && name.includes(" ")
        ? name.split(" ").map((s: string) => <Box key={s} sx={{ lineHeight: 1, }}>{s}</Box>)
        : name}
    </Typography>
  // Process operator name
  let opName = (
    t
      ? <Box
        component="abbr"
        title={op.name}
      >
        {nameComponent}
      </Box>
      : <Box
      >
        {nameComponent}
      </Box>
  )

  const imgUrl = `/img/avatars/${op.id}.png`;

  return (
    <Button
      className={op.owned ? "" : "unowned"}
      onClick={() => {
        onClick(op.id);
      }}>
      <Box
        className={op.owned ? "" : "unowned"}
        sx={{
          height: "calc(4rem + 3px)",
          width: "4rem",
          gridArea: "1 / 1",
          borderBottom: `3px solid ${rarityColors[op.rarity]}`,
        }}
      >
        <Box component="img" src={imgUrl} height="128px" width="128px" alt="" />
      </Box>
      <Box sx={{
        gridArea: "1 / 1",
        textAlign: "left",
        alignSelf: "start",
        zIndex: 1,
      }}>
        {op.favorite
          ? <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
          : ""}
      </Box>
      {opName}
    </Button>
  )
});
OperatorButton.displayName = "OperatorButton";
export default OperatorButton;