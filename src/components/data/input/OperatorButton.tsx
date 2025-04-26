import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { rarityColors } from "styles/rarityColors";
import { Favorite } from "@mui/icons-material";
import getTextWidth from "styles/getTextWidth";
import Image from "components/base/Image";
import operatorJson from "data/operators";
import imageBase from "util/imageBase";

const WIDTH_TO_PX = 10 / 7;
const LONG_CUTOFF = 77;
const LONGER_CUTOFF = 95;

interface Props {
  op_id: string;
  onClick: (opId: string) => void;
  skin?: string;
  className?: string;
}

const OperatorButton = React.memo((props: Props) => {
  const { op_id, skin, onClick, className } = props;

  const op = operatorJson[op_id];
  if (!op) return;

  const [n, t] = op.name.split(/ [Tt]he /g);
  const name = t ?? n;
  const width =
    getTextWidth(
      name,
      JSON.stringify({
        margin: 0,
        fontFamily: `"Lato",sans-serif`,
        fontWeight: 400,
        fontSize: "0.875rem",
        lineHeight: 1.66,
      }).replace(/[\{\}]+/g, "")
    ) * WIDTH_TO_PX;

  const nameComponent = (
    <Typography
      sx={{ pointerEvents: "none" }}
      variant={width > LONG_CUTOFF ? (width > LONGER_CUTOFF ? "caption3" : "caption2") : "caption"}
    >
      <Box
        sx={{
          width: "100%",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: "normal",
          textTransform: "none",
          color: "text.primary",
          height: "1.25rem",
        }}
      >
        {name}
      </Box>
    </Typography>
  );
  // Process operator name
  let opName = t ? <abbr title={op.name}>{nameComponent}</abbr> : nameComponent;

  const imgUrl = skin ?? `${imageBase}/avatars/${op_id}.webp`;

  return (
    <Button
      className={className}
      onClick={() => onClick(op_id)}
      sx={{
        display: "flex",
        flexDirection: "column",
        boxShadow: 2,
        width: "100%",
        height: "96px",
        position: "relative",
        p: 0,
      }}
    >
      <Box
        sx={{
          height: "4rem",
          width: "4rem",
          boxSizing: "content-box",
          borderBottom: `3px solid ${rarityColors[op.rarity]}`,
          position: "relative",
        }}
      >
        <Image src={imgUrl} width={64} height={64} alt="" />
        <Favorite fontSize="small" color="error" className="icon-fav" />
      </Box>
      {opName}
    </Button>
  );
});
OperatorButton.displayName = "OperatorButton";
export default OperatorButton;
