import React from "react";
import { Operator } from "types/operator";
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

export function getPotentialBonus(op: Operator) {
  const { op_id: opId, potential } = op;
  const { potentials } = operatorJson[opId as keyof typeof operatorJson];
  switch (potential) {
    case 0:
      return "-";
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      let bonus = potentials[potential - 1];
      if (bonus === "Improves Talent") {
        bonus = "⇧ Talent";
      }
      else if (bonus === "Improves First Talent") {
        bonus = "⇧ Talent 1";
      }
      else if (bonus === "Improves Second Talent") {
        bonus = "⇧ Talent 2";
      }
      else if (bonus.includes("Redeployment Time")) {
        bonus = "⇩ Redeploy";
      }
      else if (bonus.includes("Max ")) {
        bonus = bonus.substring(4);
      }
      return bonus;
    case 6:
      return "Maxed";
  }
}

interface Props {
  op: Operator;
  showPotentials: boolean;
  showBonus: boolean;
}

const RecruitableOperatorCard = React.memo((props: Props) => {
  const { op, showPotentials, showBonus } = props;

  const [n, t] = operatorJson[op.op_id].name.split(/ [Tt]he /g);
  const name = t ?? n;
  const width = getTextWidth(name, JSON.stringify(appTheme("#ffffff").typography.caption).replace(/[\{\}]+/g, "")) * WIDTH_TO_PX;

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
  let opName = (t
    ? <abbr title={operatorJson[op.op_id].name}>
      {nameComponent}
    </abbr>
    : nameComponent
  )

  const imgUrl = `/img/avatars/${op.skin ?? op.op_id}.png`;

  return (
    <Box component="li"
      sx={{
        listStyleType: "none",
        display: "grid",
        boxShadow: 2,
        borderRadius: "4px",
        backgroundColor: "background.light",
        width: "100%",
        height: "min-content",
        justifyContent: "center",
        padding: "4px",
        justifyItems: "center",
        alignItems: "center",
      }}>
      <Box
        sx={{
          height: "calc(4rem + 3px)",
          width: "4rem",
          gridArea: "1 / 1",
          borderBottom: `3px solid ${rarityColors[operatorJson[op.op_id].rarity]}`,
          position: "relative",
        }}
      >
        <Image src={imgUrl} layout="fill" alt="" />
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
      {showPotentials && (op.potential ?
        <Box
          sx={{
            height: "calc(2rem + 3px)",
            width: "2rem",
            gridArea: "1 / 2",
            position: "relative",
          }}
        >
          <Image src={`/img/potential/${op.potential}.png`}
            className={op.potential === 6 ? "max-pot" : ""}
            layout="fill"
            alt={`Potential ${op.potential}`}
          />
        </Box>
        : null
      )}
      {showBonus &&
        <Box
          sx={{
            gridArea: "3 / 1 / 3 / span 2",
            fontSize: "12px",
            lineHeight: 1.1,
            paddingBottom: "2px",
            color: "#eee"
          }}
        >
          {getPotentialBonus(op)}
        </Box>
      }
    </Box>
  )
});
RecruitableOperatorCard.displayName = "OperatorButton"
export default RecruitableOperatorCard;