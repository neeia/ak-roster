import React, { memo } from "react";
import { Operator, OperatorData } from "types/operator";
import { Box, Button, Typography } from "@mui/material";
import operatorJson from "data/operators";
import { changeMastery } from "util/changeOperator";
import Image from "next/image";

interface Props {
  masteries: number[],
  minMasteries?: number[],
  opId?: string,
  skillLevel?: number,
  eliteLevel?: number,
  onChange: (skillNumber: number, newMasteryLevel: number) => void;
}
const Mastery = memo((props: Props) => {
  const {masteries, minMasteries, opId, skillLevel, eliteLevel, onChange } = props;
  const opData = opId ? operatorJson[opId] : undefined;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      {[...Array(opData?.skillData?.length ?? 0)].map((_, skillNumber) => {
        const disabled = !opId || !skillLevel || skillLevel < 7 || !eliteLevel || eliteLevel < 2;
        return (
          <Box
            key={`maB${skillNumber}`}
            sx={{
              display: "grid",
              width: "max-content",
              gap: "0rem 1rem",
              gridTemplateAreas: `"icon name name name name"
                      "icon m m m m"`,
              gridTemplateColumns: "auto repeat(4, 1fr)",
              gridTemplateRows: "auto 1fr",
              justifyItems: "center",
              alignItems: "center",
            }}>
            <Typography
              variant="caption2"
              sx={{
                gridArea: "name",
                fontWeight: 100,
                mb: -0.25,
                zIndex: 1
              }}>
              {opData!.skillData![skillNumber].skillName}
            </Typography>
            {!opData
              ? <Box
                component="img"
                className={eliteLevel! < skillNumber ? "Mui-disabled" : ""}
                sx={{ gridArea: "icon" }}
                width="48px"
                src={`/img/skills/${opData!.skillData![skillNumber].iconId ?? opData!.skillData![skillNumber].skillId}.png`}
                alt={`Skill ${skillNumber + 1}`}
              />
              : ""}
            {[...Array(4)].map((_, masteryLevel) =>
              <Button
                className={!disabled && (masteries && masteries[skillNumber] ? masteries[skillNumber] === masteryLevel : masteryLevel === 0) ? "active" : "inactive"}
                key={`mastery${masteryLevel}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: masteryLevel + 2,
                  display: "grid",
                  "& > *": { gridArea: "1 / 1" },
                  p: 0.5,
                  minWidth: 0,
                  height: "40px",
                }}
                onClick={() => onChange(skillNumber, masteryLevel)}
                disabled={disabled || masteryLevel < (minMasteries ? minMasteries[skillNumber] : 0)}
              >
                <Image
                  width={32}
                  height={32}
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Image
                  width={32}
                  height={32}
                  src={`/img/rank/m-${masteryLevel}.png`}
                  alt={`Mastery ${masteryLevel}`}
                />
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  )
})
Mastery.displayName = "Mastery";
export default Mastery;