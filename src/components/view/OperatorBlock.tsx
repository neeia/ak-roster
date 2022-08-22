import React from "react";
import { Box, Typography } from "@mui/material";
import { Operator } from "../../types/operator";
import { Favorite } from "@mui/icons-material";
import { rarityColors } from "../../styles/rarityColors";
import { getNumSkills, MAX_LEVEL_BY_RARITY } from "../../util/changeOperator";

interface Props {
  op: Operator;
}

const OperatorBlock = React.memo((props: Props) => {
  const { op } = props;
  if (!op.owned) return null;

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
    splitName = [name, title]
  }
  if (splitName) {
    opName = (
      <span>
        <Box sx={{
          fontSize: { xs: "7px", sm: "9px" },
          lineHeight: { xs: "6px", sm: "8px" },
          marginLeft: "1px",
        }}>
          {splitName[1]}
        </Box>
        <Box sx={{
          fontSize: { xs: "11px", sm: "12px" },
          lineHeight: { xs: "11px", sm: "12px" },
          marginLeft: "1px",
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
        width: { xs: "14px", sm: "25px" },
        height: { xs: "20px", sm: "28px" },
        alignSelf: "center",
        justifySelf: "center",
      }}>
        <svg width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%"
            fill="#323232" fillOpacity="0.95" stroke="#808080" strokeWidth="1.5" />
        </svg>
      </Box>
      <Box
        component="img"
        sx={{
          gridArea: "potential",
          width: { xs: "16px", sm: "24px" },
          height: { xs: "16px", sm: "24px" },
          alignSelf: "center",
          justifySelf: "center",
        }}
        src={`/img/potential/${op.potential}.png`}
        alt={`Potential ${op.potential}`}
      />
    </Box >

  const promotionBlock =
    <Box
      sx={{
        width: { xs: "20px", sm: "32px" },
        height: { xs: "20px", sm: "32px" },
        marginBottom: { xs: "2px", sm: "2px" },
        marginLeft: { xs: "-4px", sm: "-6px" },
      }}
      component="img"
      src={`/img/elite/${op.promotion}_s_box.png`}
      height="100%"
      alt={``}
    />

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
    }}>
      {op.potential > 1 ? potentialBlock : ""}
      {op.promotion > 0 ? promotionBlock : ""}
      {op.promotion > 0 || op.level > 1 ? levelBlock : ""}
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
            "& > img": {
              gridRow: 1,
              gridColumn: 1,
              height: { xs: "16px", sm: "24px" },
              opacity: 0.95,
            },
          }}>
          <Box
            component="img"
            src={`/img/rank/bg.png`}
            alt={``}
          />
          {(!op.mastery[n] || op.mastery[n] === 0
            ? <Box
              component="img"
              src={`/img/rank/${op.skillLevel}.png`}
              alt={`Level ${op.skillLevel}`}
            />
            : <Box
              component="img"
              src={`/img/rank/m-${op.mastery[n]}.png`}
              alt={`Mastery Level ${op.mastery[n]}`}
            />
          )}
        </Box>
      )}
    </Box>

  const opModuleUrls: string[] = op.module.map((lvl: number, n: number) =>
    lvl > 0 ? `/img/equip/uniequip_00${n + 2}_${op.id.split("_")[2]}.png` : ""
  );
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
              "& > *": {
                gridArea: "1 / 1",
                width: { xs: "24px", sm: "32px" },
                height: { xs: "24px", sm: "32px" },
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
            <Box
              component="img"
              zIndex={2}
              src={url}
              alt={`Module ${n + 1}`}
            />
            {op.module[n] > 1
              ? <Box
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
              </Box> : null}
          </Box>
          : null)}
    </Box>

  return (
    <Box sx={{
      display: "grid",
      gridTemplateAreas: `"name fav" "img img"`,
      gridTemplateRows: "auto 1fr",
      gridTemplateColumns: "1fr auto",
      backgroundColor: op.favorite ? "error.dark" : "info.main",
      boxShadow: 1,
      padding: { xs: "4px 8px 4px 6px", sm: "6px 10px 8px 10px" },
      margin: { xs: "2px 4px 4px 10px", sm: "2px 16px 10px 12px" },
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
        component="img"
        src={`/img/avatars/${intermediate}.png`}
        sx={{
          gridArea: "img",
          width: { xs: "80px", sm: "120px" },
          borderBottom: `4px solid ${rarityColors[op.rarity]}`,
        }}
      />
      {levelBubble}
      {skillBlock}
      {op.module ? moduleBlock : ""}
    </Box>
  );
});
export default OperatorBlock;
