import React from "react";
import { Operator } from "types/operators/operator";
import { Box, Button, Typography } from "@mui/material";
import { rarityColors } from "styles/rarityColors";
import getTextWidth from "styles/getTextWidth";
import appTheme from "styles/theme/appTheme";
import Image from "components/base/Image";
import operatorJson from "data/operators";
import getAvatar from "util/fns/getAvatar";

const WIDTH_TO_PX = 10 / 7;
const LONG_CUTOFF = 77;
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
      } else if (bonus === "Improves First Talent") {
        bonus = "⇧ Talent 1";
      } else if (bonus === "Improves Second Talent") {
        bonus = "⇧ Talent 2";
      } else if (bonus.includes("Redeployment Time")) {
        bonus = "⇩ Redeploy";
      } else if (bonus.includes("Max ")) {
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
  onClick?: (e: React.MouseEvent<HTMLElement>, op_id: string) => void;
  disabled?: boolean;
}

const RecruitableOperatorCard = React.memo((props: Props) => {
  const { op, showPotentials, showBonus, onClick, disabled = false } = props;

  const opData = operatorJson[op.op_id];
  const [n, t] = opData.name.split(/ [Tt]he /g);
  const name = t ?? n;
  const width =
    getTextWidth(name, JSON.stringify(appTheme("#ffffff").typography.caption).replace(/[\{\}]+/g, "")) * WIDTH_TO_PX;

  const nameComponent = (
    <Typography
      component="div"
      variant={width > LONG_CUTOFF ? (width > LONGER_CUTOFF ? "caption3" : "caption2") : "caption"}
    >
      {width > LONGER_CUTOFF && name.includes(" ")
        ? name.split(" ").map((s: string) => (
            <Box key={s} sx={{ lineHeight: 1 }}>
              {s}
            </Box>
          ))
        : name}
    </Typography>
  );
  // Process operator name
  let opName = t ? <abbr title={opData.name}>{nameComponent}</abbr> : nameComponent;

  return (
    <Box component="li" sx={{ display: "contents" }}>
      <Button
        onClick={(e) => onClick?.(e, op.op_id)}
        disabled={disabled}
        sx={{
          listStyleType: "none",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          boxShadow: 2,
          borderRadius: "4px",
          backgroundColor: showPotentials && op.potential === 6 ? "background.default" : "background.light",
          width: "100%",
          height: "min-content",
          justifyContent: "center",
          padding: "4px",
          justifyItems: "center",
          alignItems: "center",
          "&:not(._):not(._)": {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            height: 64,
            width: 64,
            position: "relative",
          }}
        >
          <Image
            src={getAvatar({ ...op, ...opData })}
            width={64}
            height={64}
            alt=""
            sx={{
              borderBottom: `3px solid ${rarityColors[opData.rarity]}`,
              boxSizing: "content-box",
            }}
          />
          {showPotentials && op.potential ? (
            <Box
              sx={{
                position: "absolute",
                width: "min-content !important",
                lineHeight: 1,
                textDecoration: "none",
                backgroundColor: "grey.950",
                top: 1,
                left: 0,
              }}
            >
              P{op.potential}
            </Box>
          ) : null}
        </Box>
        <Box>{opName}</Box>
        {showBonus && (
          <Box
            sx={{
              gridArea: "3 / 1 / 3 / span 2",
              fontSize: "12px",
              lineHeight: 1.1,
              paddingBottom: "2px",
              color: "#eee",
            }}
          >
            {getPotentialBonus(op)}
          </Box>
        )}
      </Button>
    </Box>
  );
});
RecruitableOperatorCard.displayName = "OperatorButton";
export default RecruitableOperatorCard;
