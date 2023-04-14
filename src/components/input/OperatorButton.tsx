import React from "react";
import { Operator, OperatorId } from "types/operator";
import { Box, Button, Typography } from "@mui/material";
import { rarityColors } from "styles/rarityColors";
import { Favorite } from "@mui/icons-material";
import getTextWidth from "styles/getTextWidth";
import appTheme from "styles/theme/appTheme";
import Image from "next/image";
import operatorJson from "data/operators";

const WIDTH_TO_PX = 10 / 7;
const LONG_CUTOFF = 75;
const LONGER_CUTOFF = 95;

interface Props {
  op: Operator;
  onClick: (opId: OperatorId) => void;
  hidden?: boolean;
  toggled?: boolean;
  img?: string;
  alt?: string;
}

const OperatorButton = React.memo((props: Props) => {
  const { op, onClick, hidden, toggled, img, alt } = props;
  const opData = operatorJson[op.id];

  const [n, t] = opData.name.split(/ [Tt]he /g);
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
      ? <abbr title={opData.name}>
        {nameComponent}
      </abbr>
      : nameComponent
  )

  const imgUrl = `/img/avatars/${op.skin ?? op.id}.png`;

  return (
    <Box
      component="li"
      sx={{
        display: hidden ? "none" : "",
        listStyleType: "none",
      }}>
      <Button
        className={!toggled ? op.potential ? "" : "unowned" : toggled ? "toggled" : "untoggled"}
        onClick={() => onClick(op.id)}
      >
        <Box
          className={toggled || op.potential ? "" : "unowned"}
          sx={{
            height: "calc(4rem + 3px)",
            width: "4rem",
            gridArea: "1 / 1",
            borderBottom: `3px solid ${rarityColors[opData.rarity]}`,
            position: "relative"
          }}
        >
          <Image src={imgUrl} width={64} height={64} alt="" />
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
        <Box sx={{ gridArea: "2 / 1 / 2 / span 2" }}>
          {opName}
        </Box>
        {img &&
          <Box
            className={toggled || op.potential ? "" : "unowned"}
            sx={{
              height: "calc(2rem + 3px)",
              width: "2rem",
              gridArea: "1 / 2",
              position: "relative",
            }}
          >
            <Image src={img} width={32} height={32} alt={alt ?? ""} />
          </Box>
        }
      </Button>
    </Box>
  )
});
OperatorButton.displayName = "OperatorButton"
export default OperatorButton;