import React from "react";
import { Box, Typography } from "@mui/material";
import { Operator, OpJsonObj } from "../../types/operator";
import { Favorite } from "@mui/icons-material";
import { rarityColors } from "../../styles/rarityColors";
import { getNumSkills, MAX_LEVEL_BY_RARITY } from "../../util/changeOperator";
import operatorJson from "../../data/operators.json";
import Image from "next/image";

interface Props {
  op: Operator;
  nobg?: boolean;
  skill?: number;
}

const OperatorBlock = (props: Props) => {
  const { op, nobg, skill } = props;

  const opInfo: OpJsonObj = operatorJson[op.id as keyof typeof operatorJson];
  let intermediate = op.id;
  if (op.promotion === 2) {
    intermediate += "_2";
  } else if (op.promotion === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }

  const reg = /( the )|\(/g;
  const nameSplitTitle = op.name.split(reg);
  const name = nameSplitTitle.length > 1 ? nameSplitTitle[2].split(")")[0] : nameSplitTitle[0];
  const nameIsLong = name.split(" ").length > 1 && name.length > 11;

  let opName;
  let splitName;
  if (op.name.includes(" the ")) {
    splitName = op.name.split(" the ");
  }
  if (op.name.includes(" (")) {
    const name = op.name.split(" (");
    const title = name[1].split(")");
    splitName = [name[0], title]
  }
  if (splitName) {
    opName = (
      <span>
        <Box sx={{
          fontSize: { xs: "7px", sm: "9px" },
          lineHeight: { xs: "6px", sm: "8px" },
          marginLeft: "1px",
          color: !nobg && isMaxKrooster(op) ? "background.paper" : "text.main"
        }}>
          {splitName[1]}
        </Box>
        <Box sx={{
          fontSize: { xs: "11px", sm: "12px" },
          lineHeight: { xs: "11px", sm: "12px" },
          marginLeft: "1px",
          color: !nobg && isMaxKrooster(op) ? "background.paper" : "text.main"
        }}>
          {splitName[0]}
        </Box>
      </span>
    )
  } else {
    opName = (
      <Box sx={{
        fontSize: { xs: nameIsLong ? "9px" : "12px", sm: nameIsLong ? "12px" : "14px" },
        lineHeight: { xs: "17px", sm: "20px" },
        marginLeft: "1px",
      }}>
        {op.name}
      </Box>
    )
  }

  const potentialBlock =
    <Box sx={{
      display: "grid",
      gridTemplateAreas: `"potential"`,
      gridArea: "potential",
      marginLeft: "0px",
      marginBottom: { xs: "2px", sm: "8px" },
      justifySelf: "start",
    }}>
      <Box sx={{
        gridArea: "potential",
        width: { xs: "12px", sm: "20px" },
        height: { xs: "18px", sm: "20px" },
        alignSelf: "center",
        justifySelf: "center",
      }}>
        <svg width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%"
            fill="#121212" fillOpacity="0.85" stroke="#666666" strokeOpacity="0.85" strokeWidth={1.5} />
        </svg>
      </Box>
      <Box
        sx={{
          gridArea: "potential",
          width: { xs: "16px", sm: "24px" },
          height: { xs: "16px", sm: "24px" },
          alignSelf: "center",
          justifySelf: "center",
        }}
      >
        <Image src={`/img/potential/${op.potential}.png`} height="48px" width="48px" alt={`Potential ${op.potential}`} />
      </Box>
    </Box>

  const promotionBlock =
    <Box
      sx={{
        width: { xs: "20px", sm: "32px" },
        height: { xs: "20px", sm: "32px" },
        marginBottom: { xs: "2px", sm: "2px" },
        marginLeft: { xs: "-4px", sm: "-6px" },
      }}
    >
      <Image src={`/img/elite/${op.promotion}_s_box.png`} height="64px" width="64px" alt={`Elite ${op.promotion}`} />
    </Box >

  const levelSx = {
    gridArea: "level",
    display: "grid",
    gridTemplateAreas: "level",
    width: { xs: "32px", sm: "48px" },
    height: { xs: "32px", sm: "48px" },
    marginLeft: { xs: "-2px", sm: "-4px" },
    marginBottom: "-2px",
  };

  const levelBlock =
    <Box sx={{ ...levelSx }}>
      <Box sx={{
        ...levelSx
      }} >
        <svg width="100%" height="100%">
          <circle cx="50%" cy="50%" r="45%"
            fill="#323232" fillOpacity="0.95" strokeWidth="2"
            stroke={op.level === MAX_LEVEL_BY_RARITY[op.rarity][2] ? "#f7d98b" : "#808080"} />
        </svg>
      </Box>
      <Box sx={{
        ...levelSx,
        fontSize: { xs: "18px", sm: "24px" },
        lineHeight: { xs: "16px", sm: "24px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }} >
        <Box
          component="abbr"
          title="Level"
          sx={{
            gridArea: "level",
            fontSize: "9px",
            lineHeight: "4px",
            display: {
              xs: "none",
              sm: "flex",
            },
            textDecoration: "none",
            border: "none",
          }}
        >
          LV
        </Box>
        {op.level}
      </Box >
    </Box >

  const levelBubble =
    <Box sx={{
      gridArea: "img",
      alignSelf: "end",
      justifySelf: "start",
      marginLeft: "-12px",
      marginBottom: "-8px",
      display: "grid",
      gridTemplateAreas: `"potential" "elite" "level"`,
      zIndex: 1,
    }}>
      {op.potential > 1 ? potentialBlock : null}
      {op.promotion > 0 ? promotionBlock : null}
      {op.promotion > 0 || op.level > 1 ? levelBlock : null}
    </Box >

  const skillBlock =
    <Box sx={{
      gridArea: "img",
      marginTop: "4px",
      marginRight: { xs: "-14px", sm: "-24px" },
      display: op.skillLevel > 1 ? "flex" : "none",
      flexDirection: "column",
      justifySelf: "end",
      gap: "2px",
    }}>
      {[...Array(getNumSkills(op))].map((_, n: number) =>
        <Box
          key={n}
          sx={{
            display: op.promotion >= n ? "grid" : "none",
            marginLeft: { xs: "0px", sm: `${4 * n}px` },
            "& .stack": {
              gridRow: 1,
              gridColumn: 1,
              opacity: 0.95,
              width: { xs: "16px", sm: "24px" },
              height: { xs: "16px", sm: "24px" },
            },
          }}
        >
          {n === skill
            ? <Box className="stack" sx={{ transform: "translateX(-100%)" }}>
              <Image src={`/img/skills/${opInfo.skills[n].iconId ?? opInfo.skills[n].skillId}.png`} height="64px" width="64px" alt={`Skill ${n + 1}`} />
            </Box>
            : null
          }
          <Box className="stack">
            <Image src={`/img/rank/bg.png`} height="64px" width="64px" alt={`Skill ${n + 1}`} />
          </Box>
          {(!op.mastery || !op.mastery[n] || op.mastery[n] === 0
            ? <Box className="stack">
              <Image src={`/img/rank/${op.skillLevel}.png`} height="64px" width="64px" alt={`Rank ${op.skillLevel}`} />
            </Box>
            : <Box className="stack">
              <Image src={`/img/rank/m-${op.mastery[n]}.png`} height="64px" width="64px" alt={`Mastery ${op.mastery[n]}`} />
            </Box>
          )}
        </Box>
      )}
    </Box>

  const opModuleUrls: string[] = op.module ? op.module.map((lvl: number, n: number) =>
    lvl > 0 ? `/img/equip/${opInfo.modules[n].typeName.toLowerCase()}.png` : ""
  ) : [];
  const moduleBlock =
    <Box sx={{
      gridArea: "img",
      display: "flex",
      flexDirection: "row-reverse",
      alignSelf: "end",
      mb: "-4px",
      marginRight: { xs: "-12px", sm: "-16px" },
      gap: { xs: "2px", sm: "4px" },
    }}>
      {opModuleUrls.map((url: string, n: number) =>
        url
          ? <Box
            key={n}
            sx={{
              display: "grid",
              width: { xs: "24px", sm: "32px" },
              "& > *": {
                gridArea: "1 / 1",
                width: "100%",
              },
              "& .frame": {
                opacity: "0.75",
                backgroundColor: "info.main",
                border: "1px solid #808080",
              }
            }}
          >
            <Box
              zIndex={1}
              className="frame"
            />
            <Box zIndex={2} sx={{ display: "inherit" }}>
              <Image src={url} height="64px" width="64px" alt={`Module ${n + 1}`} />
            </Box>
            {op.module[n] > 1
              ? <Typography
                zIndex={3}
                component="abbr"
                title={`Stage ${op.module[n]}`}
                sx={{
                  textDecoration: "none",
                  border: "none",
                  fontSize: { xs: "1rem", sm: "1.5rem" },
                  fontWeight: 900,
                  textAlign: "right",
                  color: "text.primary",
                  WebkitTextFillColor: "white",
                  WebkitTextStroke: "1px black",
                }}
              >
                {op.module[n]}
              </Typography> : null}
          </Box>
          : null)}
    </Box>

  return (
    <Box sx={{
      display: "grid",
      gridTemplateAreas: `"name fav" "img img"`,
      gridTemplateRows: "auto 1fr",
      gridTemplateColumns: "1fr auto",
      backgroundColor: nobg ? "info.main"
        : op.favorite
          ? isMaxKrooster(op)
            ? "primary.dark" : "error.dark"
          : "info.main",
      boxShadow: 1,
      padding: { xs: "4px 8px 4px 6px", sm: "6px 10px 8px 10px" },
      margin: { xs: "2px 4px 4px 10px", sm: "2px 16px 10px 12px" },
      opacity: op.owned ? 1 : 0.5,
      borderRadius: "4px",
    }}>
      {opName}
      <Favorite
        fontSize="inherit"
        color="error"
        sx={{
          display: op.favorite ? "inherit" : "none",
          alignSelf: "center",
          justifySelf: "end",
          lineHeight: "0px",
          marginRight: "-2px",
        }}
      />
      <Box
        sx={{
          gridArea: "img",
          height: { xs: "84px", sm: "124px" },
          width: { xs: "80px", sm: "120px" },
          borderBottom: `4px solid ${rarityColors[op.rarity]}`,
        }}
      >
        <Image src={`/img/avatars/${op.skin ?? intermediate}.png`} height="256px" width="256px" alt="" />
      </Box>
      {levelBubble}
      {skillBlock}
      {op.module ? moduleBlock : ""}
    </Box>
  );
}
export default OperatorBlock;

function isMaxKrooster(op: Operator) {
  return op.id === "char_1021_kroos2" && op.potential === 6 && op.level === 80 && op.mastery.every(v => v === 3);
}