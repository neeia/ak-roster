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
  hidden: boolean;
}

const OperatorButton = ((props: Props) => {
  const { op, onClick, hidden } = props;
  if (!op.name) return null;
  const [n, t] = op.name.split(" the ");
  const name = t ?? n;
  const width = getTextWidth(name, JSON.stringify(appTheme.typography.caption).replace(/[\{\}]+/g, "")) * WIDTH_TO_PX;
  const [selected, setSelected] = React.useState(false);

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
    <Box
      component="li"
      className={op.owned ? "" : "unowned"}
      sx={{ listStyleType: "none", display: hidden ? "none" : "" }}
    >
      <Button
        onClick={() => {
          setSelected(!selected);
          onClick(op.id);
        }}>
        <Box
          component="img"
          loading="lazy"
          sx={{
            height: `4rem`,
            width: `4rem`,
            gridArea: "1 / 1",
            borderBottom: `3px solid ${rarityColors[op.rarity]}`,
          }}
          src={imgUrl}
          alt=""
        />
        <Box sx={{
          gridArea: "1 / 1",
          textAlign: "left",
          alignSelf: "start",
        }}>
          {op.favorite
            ? <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
            : ""}
        </Box>
        {opName}
      </Button>
    </Box>
  )
});

export default OperatorButton;