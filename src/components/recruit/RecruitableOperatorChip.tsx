import { Chip, Box, Typography, Divider } from "@mui/material";
import Image from "next/image";
import React from "react";
import { Operator } from "types/operator";
import { getPotentialBonus } from "./RecruitableOperatorCard";

interface Props {
  op: Operator;
  showPotentials: boolean;
  showBonus: boolean;
}
const RecruitableOperatorChip = React.memo((props: Props) => {
  const { op, showPotentials, showBonus } = props;
  return (
    <>
      <Chip sx={{ height: "auto", minHeight: "32px", }}
        className={`rarity-${op.rarity}`}
        avatar={
          <Box ml={1} mr={-2}>
            <Image
              src={`/img/avatars/${op.id}.png`}
              width={24}
              height={24}
              className={op.potential === 6 ? "max-pot" : ""}
              alt=""
            />
          </Box>
        }
        label={
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mr: -0.5,
            "& img": {
              filter: op.potential ? `drop-shadow(0px 0px 2px rgba(${`${(1 - op.potential / 3) * 255 + 127.5},`.repeat(3)} 0.35))` : undefined,
            }
          }}>
            <Box sx={{ display: showBonus ? "flex" : "contents", flexDirection: "column" }}>
              <Typography component="span"
                sx={{ color: "#000" }}
              >
                {op.name}
              </Typography>
              {showBonus &&
                <Box
                  sx={{
                    fontSize: "11px",
                    color: "#422",
                    lineHeight: 1,
                    paddingBottom: "2px",
                  }}
                >
                  {getPotentialBonus(op)}
                </Box>
              }
            </Box>
            {showPotentials && (op.potential > 0) &&
              <>
                <Divider orientation="vertical" flexItem />
                <Image src={`/img/potential/${op.potential}.png`}
                  alt={`Potential ${op.potential}`}
                  width={24}
                  height={24}
                />
              </>
            }
          </Box>
        }
      />
    </>
  );
}
);
RecruitableOperatorChip.displayName = "RecruitableOperatorChip";
export default RecruitableOperatorChip;