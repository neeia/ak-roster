import React from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { ModuleData, OpInfo } from "types/operators/operator";
import { rarityColors } from "styles/rarityColors";
import { MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import Image from "components/base/Image";
import getAvatar from "util/fns/getAvatar";
import imageBase from "util/imageBase";

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
        <line x1="0" y1="0" x2="23" y2="23" stroke="grey" strokeWidth="1" />
      </svg>
    </Box>
  );
};

function getModUrl(mod: ModuleData) {
  return `${imageBase}/equip/${mod.typeName.toLowerCase()}.webp`;
}

interface Props extends BoxProps {
  op: OpInfo;
}

const SupportBlock = (props: Props) => {
  const { op, sx, ...rest } = props;

  const reg = /( the )|\(/gi;
  const splitName = op.name.replace(/\)$/, "").split(reg);
  const name = splitName[0];
  const nameIsLong = name.split(" ").length > 1 && name.length >= 16;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        backgroundColor: "background.paper",
        padding: "4px 8px 4px 6px",
        margin: "2px 4px 4px 10px",
        borderRadius: "4px",
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
        <Image
          src={getAvatar(op)}
          alt=""
          sx={{
            height: 80,
            aspectRatio: "1 / 1",
            boxSizing: "content-box",
            borderBottom: `4px solid ${rarityColors[op.rarity]}`,
          }}
        />
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
          {op.potential > 1 && (
            <Box
              className="potential"
              sx={{
                position: "relative",
                width: "12px",
                height: "16px",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "background.light",
                ml: "4px",
                marginBottom: "2px",
              }}
            >
              <Image
                src={`${imageBase}/potential/${op.potential}.webp`}
                alt={`Potential ${op.potential}`}
                sx={{
                  width: "16px",
                  height: "16px",
                  m: "auto",
                  position: "absolute",
                  left: -4,
                  right: -4,
                  top: -4,
                  bottom: -4,
                  backgroundImage: `url('${imageBase}/rank/bg.webp')`,
                  backgroundSize: "100% 100%",
                }}
              />
            </Box>
          )}
          <Image
            src={`${imageBase}/elite/${op.elite}_s_box.webp`}
            alt={`Elite ${op.elite}`}
            className="elite"
            sx={{
              width: { xs: "20px" },
              height: { xs: "20px" },
              position: "relative",
              marginBottom: { xs: "0px" },
            }}
          />
          <Box
            className="level"
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
              backgroundColor: "background.paper",
              border: "2px solid",
              borderColor: op.level === MAX_LEVEL_BY_RARITY[op.rarity][2] ? "primary.main" : "grey.500",
            }}
          >
            {op.level}
          </Box>
        </Box>
      </Box>
      {/* Skills & Modules */}
      <Box sx={{ alignSelf: "end", display: "flex", flexDirection: "column", alignItems: "start", gap: "4px" }}>
        {/* Skills */}
        <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "12px" }}>Skills</Typography>
        <Box
          sx={{
            display: "flex",
            gap: "2px",
          }}
        >
          {[...Array(3)].map((_, i: number) => {
            if (!op.skillData?.[i]) return <SpaceFiller key={i} />;
            return (
              <Image
                src={`${imageBase}/rank/${!op.masteries[i] ? op.skill_level : `m-${op.masteries[i]}`}.webp`}
                alt={!op.masteries[i] ? `Skill ${i + 1} Rank ${op.skill_level}` : `Mastery ${op.masteries[i]}`}
                key={i}
                sx={{
                  opacity: op.elite >= i ? 1 : 0.25,
                  marginLeft: 0,
                  width: 24,
                  height: 24,
                  backgroundImage: `url('${imageBase}/rank/bg.webp')`,
                  backgroundSize: "100% 100%",
                }}
              />
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
            if (!op.moduleData?.[i]) return <SpaceFiller key={i} />;
            const mod = op.moduleData[i];
            const modLevel = op.modules[mod.moduleId];
            return (
              <Box
                key={mod.moduleId}
                sx={{
                  position: "relative",
                  width: 24,
                  height: 24,
                  backgroundImage: `url('${imageBase}/rank/bg.webp')`,
                  backgroundSize: "100% 100%",
                  opacity: modLevel ? 1 : 0.25,
                }}
              >
                <Image
                  src={getModUrl(mod)}
                  alt={mod.typeName}
                  sx={{
                    width: 24,
                    height: 24,
                  }}
                />
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
                  {modLevel > 1 && modLevel}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
export default SupportBlock;
