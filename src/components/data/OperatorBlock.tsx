import React from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { ModuleData, OpInfo } from "types/operators/operator";
import { Favorite } from "@mui/icons-material";
import { rarityColors } from "styles/rarityColors";
import { MAX_PROMOTION_BY_RARITY, MAX_LEVEL_BY_RARITY, getMaxPotentialById } from "util/changeOperator";
import Image from "components/base/Image";
import getAvatar from "util/fns/getAvatar";
import imageBase from "util/imageBase";

function getModUrl(mod: ModuleData) {
  return `${imageBase}/equip/${mod.typeName.toLowerCase()}.webp`;
}

interface Props extends BoxProps {
  op: OpInfo;
}

const OperatorBlock = (props: Props) => {
  const { op, sx, ...rest } = props;

  const reg = /( the )|\(/gi;
  const splitName = op.name.replace(/\)$/, "").split(reg);
  const name = splitName[0];
  const nameIsLong = name.split(" ").length > 1 && name.length >= 16;

  function isOperatorMaxed(op: OpInfo) {
    if (op.elite !== MAX_PROMOTION_BY_RARITY[op.rarity]) return false;
    if (op.level !== MAX_LEVEL_BY_RARITY[op.rarity][2]) return false;
    if (op.rarity > 2 && op.skill_level !== 7) return false;
    if (MAX_PROMOTION_BY_RARITY[op.rarity] === 2) {
      if (!op.skillData?.every((_, m) => op.masteries[m] === 3)) return false;
      if (!(op.moduleData?.every(({ moduleId, isCnOnly }) => isCnOnly || op.modules[moduleId] === 3) ?? false))
        return false;
    }
    if (op.potential !== getMaxPotentialById(op.op_id)) return false;

    return true;
  }
  const maxed = isOperatorMaxed(op);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.light",
        boxShadow: maxed ? `0px 0px 8px ${rarityColors[op.rarity]}` : 1,
        padding: { xs: "4px 8px 4px 6px", sm: "6px 10px 8px 10px" },
        margin: { xs: "2px 4px 4px 10px", sm: "4px 12px 12px 12px" },
        borderRadius: "4px",
        height: "min-content",
        width: "min-content",
        ...sx,
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: { xs: "17px", sm: "20px" },
          marginLeft: "1px",
          color: "text.primary",
          "& > div + div": {
            fontSize: { xs: "11px", sm: "12px" },
            lineHeight: { xs: "11px", sm: "12px" },
          },
        }}
      >
        {splitName[2] && (
          <Box
            sx={{
              fontSize: { xs: "7px", sm: "9px" },
              lineHeight: { xs: "6px", sm: "8px" },
            }}
          >
            {splitName[2]}
          </Box>
        )}
        <Box
          sx={{
            fontSize: {
              xs: nameIsLong ? "9px" : "12px",
              sm: nameIsLong ? "11px" : "14px",
            },
            lineHeight: {
              xs: nameIsLong ? "9px" : "17px",
              sm: nameIsLong ? "10px" : "20px",
            },
            textOverflow: nameIsLong ? "wrap" : "",
          }}
        >
          {splitName[0]}
        </Box>
      </Box>
      <Favorite
        fontSize="inherit"
        color="error"
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          display: op.favorite ? "inherit" : "none",
        }}
      />
      <Box
        sx={{
          height: { xs: "80px", sm: "120px" },
          aspectRatio: "1 / 1",
          boxSizing: "content-box",
          borderBottom: `4px solid ${rarityColors[op.rarity]}`,
          position: "relative",
          filter: maxed ? (theme) => `drop-shadow(0px 0px 8px ${theme.palette.background.paper})` : 0,
        }}
      >
        <Image src={getAvatar(op)} sx={{ width: "100%", height: "100%" }} alt="" />
        {maxed && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: -4,
              px: 0.5,
              backgroundColor: rarityColors[op.rarity],
              color: "#121212",
              borderRadius: "4px 4px 0px 0px",
              fontSize: { xs: 12, sm: 14 },
            }}
          >
            Maxed
          </Box>
        )}
      </Box>
      {!maxed && (
        <>
          {/* Potential, Promotion, Level */}
          <Box
            sx={{
              position: "absolute",
              left: -12,
              bottom: -8,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              zIndex: 1,
            }}
          >
            {op.potential > 1 ? (
              <Image
                src={`${imageBase}/potential/${op.potential}.webp`}
                alt={`Potential ${op.potential}`}
                sx={{
                  width: { xs: "12px", sm: "20px" },
                  height: { xs: "16px", sm: "24px" },
                  m: "auto",
                  ml: "4px",
                  marginBottom: { xs: "2px", sm: "8px" },
                  backgroundImage: `url('${imageBase}/rank/bg.webp')`,
                  backgroundSize: "100% 100%",
                }}
              />
            ) : null}
            {op.elite > 0 ? (
              <Image
                src={`${imageBase}/elite/${op.elite}_s_box.webp`}
                alt={`Elite ${op.elite}`}
                sx={{
                  width: { xs: "20px", sm: "32px" },
                  height: { xs: "20px", sm: "32px" },
                  marginBottom: { xs: "0px", sm: "4px" },
                }}
              />
            ) : null}
            {op.elite > 0 || op.level > 1 ? (
              <Box
                sx={{
                  height: { xs: "32px", sm: "48px" },
                  aspectRatio: "1 / 1",
                  fontSize: { xs: "18px", sm: "24px" },
                  lineHeight: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "background.default",
                  border: "2px solid",
                  borderColor: op.level === MAX_LEVEL_BY_RARITY[op.rarity][2] ? "primary.light" : "grey.500",
                }}
              >
                <Box
                  component="abbr"
                  title="Level"
                  sx={{
                    fontSize: "9px",
                    lineHeight: "4px",
                    display: {
                      xs: "none",
                      sm: "flex",
                    },
                    textDecoration: "none",
                  }}
                >
                  LV
                </Box>
                {op.level}
              </Box>
            ) : null}
          </Box>
          {/* Skills */}
          <Box
            sx={{
              position: "absolute",
              top: 32,
              right: { xs: "0px", sm: "-12px" },
              display: op.skill_level > 1 ? "flex" : "none",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {[...Array(op.skillData?.length ?? 0)].map((_, i: number) => (
              <Image
                key={i}
                src={
                  !op.masteries[i]
                    ? `${imageBase}/rank/${op.skill_level}.webp`
                    : `${imageBase}/rank/m-${op.masteries[i]}.webp`
                }
                alt={`Skill ${i + 1} Rank ${op.skill_level}`}
                sx={{
                  display: op.elite >= i ? "grid" : "none",
                  marginLeft: { xs: "0px", sm: `${4 * i}px` },
                  width: { xs: "16px", sm: "24px" },
                  height: { xs: "16px", sm: "24px" },
                  backgroundImage: `url('${imageBase}/rank/bg.webp')`,
                  backgroundSize: "contain",
                }}
              />
            ))}
          </Box>
          {/* Modules */}
          <Box
            sx={{
              position: "absolute",
              right: -8,
              bottom: -12,
              display: "flex",
              flexDirection: "row-reverse",
              alignSelf: "end",
              gap: "4px",
            }}
          >
            {(op.moduleData ?? [])
              .filter((mod) => op.modules[mod.moduleId] > 0)
              .map((mod) => (
                <Box
                  key={mod.moduleId}
                  sx={{
                    position: "relative",
                    height: { xs: "24px", sm: "32px" },
                    aspectRatio: "1 / 1",
                    backgroundColor: "background.default",
                    backgroundImage: `url('${imageBase}/rank/bg.webp')`,
                    backgroundSize: "100% 100%",
                  }}
                >
                  <Image
                    src={getModUrl(mod)}
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                    alt={mod.typeName}
                  />
                  <Typography
                    zIndex={1}
                    component="abbr"
                    title={`Stage ${op.modules[mod.moduleId]}`}
                    sx={{
                      fontSize: { xs: "10px", sm: "12px" },
                      position: "absolute",
                      width: "min-content !important",
                      lineHeight: 1,
                      textDecoration: "none",
                      backgroundColor: "grey.950",
                      pl: "2px",
                      right: -1,
                      bottom: -1,
                    }}
                  >
                    {mod.typeName.slice(-1)}
                    {op.modules[mod.moduleId] > 1 && op.modules[mod.moduleId]}
                  </Typography>
                </Box>
              ))}
          </Box>
        </>
      )}
    </Box>
  );
};
export default OperatorBlock;
