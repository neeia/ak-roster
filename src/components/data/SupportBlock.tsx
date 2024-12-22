import React from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { ModuleData, OpInfo } from "types/operators/operator";
import { rarityColors } from "styles/rarityColors";
import { MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import Image from "next/image";
import getAvatar from "util/fns/getAvatar";

const SpaceFiller = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: 24,
        height: 24,
        backgroundColor: "background.default",
        border: "1px solid",
        borderColor: "background.light",
        opacity: 0.5,
      }}
    >
      <svg>
        <line x1="0" y1="0" x2="24" y2="24" stroke="grey" strokeWidth="1" />
      </svg>
    </Box>
  );
};

function getModUrl(mod: ModuleData) {
  return `/img/equip/${mod.typeName.toLowerCase()}.png`;
}

interface Props extends BoxProps {
  op: OpInfo;
}

const OperatorBlock = (props: Props) => {
  const { op, sx, ...rest } = props;

  let intermediate = op.op_id;
  if (op.elite === 2) {
    intermediate += "_2";
  } else if (op.elite === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }

  const reg = /( the )|\(/gi;
  const splitName = op.name.replace(/\)$/, "").split(reg);
  const name = splitName[0];
  const nameIsLong = name.split(" ").length > 1 && name.length >= 16;

  const iconSizes = "(max-width: 768px) 16px, 24px";

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        backgroundColor: "background.paper",
        boxShadow: 1,
        padding: { xs: "4px 8px 4px 6px" },
        margin: { xs: "2px 4px 4px 10px" },
        borderRadius: "4px",
        height: "min-content",
        width: "min-content",
        gap: 2,
        ...sx,
      }}
      {...rest}
    >
      <Box sx={{ position: "relative" }}>
        {/* Name */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: { xs: "17px" },
            marginLeft: "1px",
            color: "text.primary",
            "& > div + div": {
              fontSize: { xs: "11px" },
              lineHeight: { xs: "11px" },
            },
          }}
        >
          {splitName[2] && (
            <Box
              sx={{
                fontSize: { xs: "7px" },
                lineHeight: { xs: "6px" },
              }}
            >
              {splitName[2]}
            </Box>
          )}
          <Box
            sx={{
              fontSize: {
                xs: nameIsLong ? "9px" : "12px",
              },
              lineHeight: {
                xs: nameIsLong ? "9px" : "17px",
              },
              textOverflow: nameIsLong ? "wrap" : "",
            }}
          >
            {splitName[0]}
          </Box>
        </Box>
        {/* Avatar */}
        <Box
          sx={{
            height: 80,
            aspectRatio: "1 / 1",
            boxSizing: "content-box",
            borderBottom: `4px solid ${rarityColors[op.rarity]}`,
            position: "relative",
          }}
        >
          <Image src={getAvatar(op)} fill sizes="(max-width: 768px) 80px, 120px" alt="" />
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: -8,
            bottom: -8,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            zIndex: 1,
          }}
        >
          {op.potential > 1 ? (
            <Box
              sx={{
                position: "relative",
                width: { xs: "12px" },
                height: { xs: "16px" },
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "background.light",
                ml: "4px",
                marginBottom: "2px",
              }}
            >
              <Box
                sx={{
                  width: { xs: "16px" },
                  height: { xs: "16px" },
                  position: "absolute",
                  m: "auto",
                  left: -4,
                  right: -4,
                  top: -4,
                  bottom: -4,
                }}
              >
                <Image
                  src={`/img/potential/${op.potential}.png`}
                  fill
                  sizes={iconSizes}
                  alt={`Potential ${op.potential}`}
                />
              </Box>
            </Box>
          ) : null}
          <Box
            sx={{
              width: { xs: "20px" },
              height: { xs: "20px" },
              position: "relative",
              marginBottom: { xs: "0px" },
            }}
          >
            <Image
              src={`/img/elite/${op.elite}_s_box.png`}
              fill
              sizes="(max-width: 768px) 20px, 32px"
              alt={`Elite ${op.elite}`}
            />
          </Box>
          <Box
            sx={{
              height: { xs: "32px" },
              aspectRatio: "1 / 1",
              fontSize: { xs: "18px" },
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: "background.light",
              border: "2px solid",
              borderColor: op.level === MAX_LEVEL_BY_RARITY[op.rarity][2] ? "primary.light" : "grey.500",
            }}
          >
            {op.level}
          </Box>
        </Box>
      </Box>
      {/* Potential, Promotion, Level */}
      <Box sx={{ alignSelf: "end", display: "flex", flexDirection: "column", alignItems: "start", gap: "4px" }}>
        {/* Skills */}
        <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "12px" }}>Skills</Typography>
        <Box
          sx={{
            display: op.skill_level > 1 ? "flex" : "none",
            gap: "2px",
          }}
        >
          {[...Array(3)].map((_, i: number) => {
            if (!op.skillData?.[i]) return <SpaceFiller key={i} />;
            return (
              <Box
                key={i}
                sx={{
                  display: op.elite >= i ? "grid" : "none",
                  marginLeft: 0,
                  width: 24,
                  height: 24,
                  position: "relative",
                  backgroundImage: "url('/img/rank/bg.png')",
                  backgroundSize: "contain",
                }}
              >
                {op.masteries[i] < 1 ? (
                  <Image
                    src={`/img/rank/${op.skill_level}.png`}
                    fill
                    sizes={iconSizes}
                    alt={`Skill ${i + 1} Rank ${op.skill_level}`}
                  />
                ) : (
                  <Image
                    src={`/img/rank/m-${op.masteries[i]}.png`}
                    fill
                    sizes={iconSizes}
                    alt={`Mastery ${op.masteries[i]}`}
                  />
                )}
              </Box>
            );
          })}
        </Box>
        {/* Modules */}
        <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "12px" }}>Modules</Typography>
        <Box
          sx={{
            display: "flex",
            alignSelf: "end",
            gap: "2px",
          }}
        >
          {[...Array(3)].map((_, i) => {
            if (!op.moduleData?.[i]) return <SpaceFiller />;
            const mod = op.moduleData[i];
            return (
              <Box
                key={mod.moduleId}
                sx={{
                  position: "relative",
                  display: "grid",
                  height: 24,
                  aspectRatio: "1 / 1",
                  backgroundColor: "background.default",
                  border: "1px solid",
                  borderColor: "background.light",
                }}
              >
                <Image src={getModUrl(mod)} fill sizes="(max-width: 768px) 24px, 32px" alt={mod.typeName} />
                <Typography
                  zIndex={1}
                  component="abbr"
                  title={`Stage ${op.modules[mod.moduleId]}`}
                  sx={{
                    fontSize: "10px",
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
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
export default OperatorBlock;
