import React from "react";
import { Box, Typography } from "@mui/material";
import { Operator, OperatorData } from "../../types/operator";
import { Favorite } from "@mui/icons-material";
import { rarityColors } from "../../styles/rarityColors";
import { MAX_LEVEL_BY_RARITY } from "../../util/changeOperator";
import operatorJson from "../../data/operators.json";
import Image from "next/image";

interface Props {
  op: Operator;
  nobg?: boolean;
  skill?: number;
}

const OperatorBlock = (props: Props) => {
  const { op, nobg, skill } = props;

  const opData: OperatorData = operatorJson[op.id as keyof typeof operatorJson];
  let intermediate = op.id;
  if (op.elite === 2) {
    intermediate += "_2";
  } else if (op.elite === 1 && opData.name === "Amiya") {
    intermediate += "_1";
  }

  const reg = /( the )|\(/gi;
  const splitName = opData.name.replace(/\)$/, '').split(reg);
  const name = splitName.length > 1 ? splitName[2].split(")")[0] : splitName[0];
  const nameIsLong = name.split(" ").length > 1 && name.length > 11;

  const opName = (
    <Box sx={{
      marginLeft: "1px",
      color: !nobg && isMaxKrooster(op) ? "background.paper" : "text.primary",
      "& > div.opName": {
        fontSize: { xs: nameIsLong ? "9px" : "12px", sm: nameIsLong ? "12px" : "14px" },
        lineHeight: { xs: "17px", sm: "20px" },
      },
      "& > div + div.opName": {
        fontSize: { xs: "11px", sm: "12px" },
        lineHeight: { xs: "11px", sm: "12px" },
      }
    }}>
      {splitName[2] &&
        <Box sx={{
          fontSize: { xs: "7px", sm: "9px" },
          lineHeight: { xs: "6px", sm: "8px" },
        }}>
          {splitName[2]}
        </Box>
      }
      <Box className="opName">
        {splitName[0]}
      </Box>
    </Box>
  )

  const iconSizes = "(max-width: 768px) 16px, 24px";
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
          position: "relative",
        }}
      >
        <Image src={`/img/potential/${op.potential}.png`} fill sizes={iconSizes} alt={`Potential ${op.potential}`} />
      </Box>
    </Box>

  const promotionBlock =
    <Box
      sx={{
        width: { xs: "20px", sm: "32px" },
        height: { xs: "20px", sm: "32px" },
        marginBottom: { xs: "2px", sm: "2px" },
        marginLeft: { xs: "-4px", sm: "-6px" },
        position: "relative",
      }}
    >
      <Image src={`/img/elite/${op.elite}_s_box.png`} fill sizes="(max-width: 768px) 20px, 32px" alt={`Elite ${op.elite}`} />
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
            stroke={op.level === MAX_LEVEL_BY_RARITY[opData.rarity][2] ? "#f7d98b" : "#808080"} />
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
      {op.elite > 0 ? promotionBlock : null}
      {op.elite > 0 || op.level > 1 ? levelBlock : null}
    </Box >

  const skillBlock =
    <Box sx={{
      gridArea: "img",
      marginTop: "4px",
      marginRight: { xs: "-14px", sm: "-24px" },
      display: op.rank > 1 ? "flex" : "none",
      flexDirection: "column",
      justifySelf: "end",
      gap: "2px",
    }}>
      {[...Array(opData.skills.length)].map((_, n: number) =>
        <Box
          key={n}
          sx={{
            display: op.elite >= n ? "grid" : "none",
            marginLeft: { xs: "0px", sm: `${4 * n}px` },
            "& .stack": {
              gridRow: 1,
              gridColumn: 1,
              opacity: skill === undefined || n === skill ? 0.95 : 0.25,
              boxShadow: skill !== undefined && n === skill ? "-2px 0px #ffd440" : "",
              width: { xs: "16px", sm: "24px" },
              height: { xs: "16px", sm: "24px" },
              position: "relative"
            },
          }}
        >
          <Box className="stack">
            <Image src={`/img/rank/bg.png`}
              fill
              sizes={iconSizes}
              alt={`Skill ${n + 1}`}
            />
          </Box>
          {(!op.masteries || !op.masteries[n] || op.masteries[n] === 0
            ? <Box className="stack">
              <Image src={`/img/rank/${op.rank}.png`}
                fill
                sizes={iconSizes}
                alt={`Rank ${op.rank}`}
              />
            </Box>
            : <Box className="stack">
              <Image src={`/img/rank/m-${op.masteries[n]}.png`}
                fill
                sizes={iconSizes}
                alt={`Mastery ${op.masteries[n]}`}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>

  const opModuleUrls = op.modules ? op.modules
    .map((mod, n: number) => {
      return {
        typeName: opData.modules[n].typeName,
        url: `/img/equip/${opData.modules[n].typeName.toLowerCase()}.png`,
        index: n,
        mod
      }
    })
    .filter(({ mod }) => mod > 0)
    : [];
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
      {opModuleUrls.map(({ typeName, url, index }, n: number) =>
        <Box
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
            },
          }}
        >
          <Box
            zIndex={1}
            className="frame"
          />
          <Box zIndex={2} sx={{ display: "inherit" }}>
            <Image src={url} height={64} width={64} alt={typeName} />
          </Box>
          <Typography
            zIndex={3}
            component="abbr"
            title={`Stage ${op.modules[index]}`}
            sx={{
              display: "flex",
              justifySelf: "end",
              alignSelf: "end",
              width: "min-content !important",
              height: "min-content",
              lineHeight: 1.25,
              textDecoration: "none",
              border: "none",
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              color: "text.primary",
              backgroundColor: "rgba(0,0,0,0.8)",
              borderRadius: 999,
              marginRight: "-10%",
              marginBottom: "-25%",
            }}
          >
            {typeName.slice(-1)}
            {op.modules[index] > 1 && op.modules[index]}
          </Typography>
        </Box>
      )}
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
      opacity: op.potential ? 1 : 0.5,
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
          borderBottom: `4px solid ${rarityColors[opData.rarity]}`,
          position: "relative"
        }}
      >
        <Image src={`/img/avatars/${op.skin ?? intermediate}.png`}
          fill
          sizes="(max-width: 768px) 80px, 120px"
          alt=""
        />
      </Box>
      {levelBubble}
      {skillBlock}
      {op.modules ? moduleBlock : ""}
    </Box>
  );
}
export default OperatorBlock;

function isMaxKrooster(op: Operator) {
  return op.id === "char_1021_kroos2" && op.potential === 6 && op.level === 80 && op.masteries.every(v => v === 3);
}