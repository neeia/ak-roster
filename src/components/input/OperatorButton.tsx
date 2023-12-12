import React from "react";
import { Operator } from "types/operator";
import { Box, Button, Typography } from "@mui/material";
import { rarityColors } from "styles/rarityColors";
import { Favorite } from "@mui/icons-material";
import getTextWidth from "styles/getTextWidth";
import appTheme from "styles/theme/appTheme";
import Image from "next/image";

const WIDTH_TO_PX = 10 / 7;
const LONG_CUTOFF = 72;
const LONGER_CUTOFF = 95;

interface Props {
  op: Operator;
  onClick: (opId: string) => void;
  hidden?: boolean;
  toggled?: boolean;
  img?: string;
  alt?: string;
}

const OperatorButton = React.memo((props: Props) => {
  const { op, onClick, hidden, toggled, img, alt } = props;

  const [n, t] = op.name.split(/ [Tt]he /g);
  const name = t ?? n;
  const width = getTextWidth(name, JSON.stringify(appTheme.typography.caption).replace(/[\{\}]+/g, "")) * WIDTH_TO_PX;

  const nameComponent = <Typography component="div"
    variant={width > LONG_CUTOFF ? width > LONGER_CUTOFF ? "caption3" : "caption2" : "caption"}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "calc(100% + 1rem)",
      height: 20,
      lineHeight: 1,
      color: "text.primary",
      letterSpacing: "normal",
      textTransform: "none",
      flexDirection: "column",
      mx: -0.5,
    }}
  >
    {name}
  </Typography>

  // Process operator name
  let opName = (
    t
      ? <abbr title={op.name}>
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
        className={toggled === undefined ? op.owned ? "" : "unowned" : toggled ? "toggled" : "untoggled"}
        onClick={() => onClick(op.id)}
      >
        <Box
          className={toggled || op.owned ? "" : "unowned"}
          sx={{
            height: "calc(4rem + 3px)",
            width: "4rem",
            gridArea: "1 / 1",
            borderBottom: `3px solid ${rarityColors[op.rarity]}`,
          }}
        >
          <Image src={imgUrl} height="128px" width="128px" alt="" />
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
            className={toggled || op.owned ? "" : "unowned"}
            sx={{
              height: "calc(2rem + 3px)",
              width: "2rem",
              gridArea: "1 / 2",
              position: "relative",
            }}
          >
            <Image src={img} layout="fill" alt={alt ?? ""} />
          </Box>
        }
      </Button>
    </Box>
  )
});
OperatorButton.displayName = "OperatorButton"
export default OperatorButton;