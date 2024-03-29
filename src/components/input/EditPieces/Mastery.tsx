import React from "react";
import { Operator, OpJsonObj } from "types/operator";
import { Box, Button, IconButton, Typography } from "@mui/material";
import operatorJson from "data/operators.json";
import { changeMastery, getNumSkills } from "util/changeOperator";
import Image from "next/image";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const Mastery = ((props: Props) => {
  const { op, onChange } = props;
  const opInfo: OpJsonObj = operatorJson[op.id as keyof typeof operatorJson];

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      {[...Array(getNumSkills(op))].map((_, i) => {
        const disabled = !op.owned || op.skillLevel < 7 || op.promotion < 2;
        return (
          <Box
            key={`maB${i}`}
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
              {opInfo.skills[i].skillName}
            </Typography>
            {opInfo !== undefined
              ? <Box
                component="img"
                className={op.promotion < i ? "Mui-disabled" : ""}
                sx={{ gridArea: "icon" }}
                width="48px"
                src={`/img/skills/${opInfo.skills[i].iconId ?? opInfo.skills[i].skillId}.png`}
                alt={`Skill ${i + 1}`}
              />
              : ""}
            {[...Array(4)].map((_, j) =>
              <Button
                className={!disabled && (op.mastery && op.mastery[i] ? op.mastery[i] === j : j === 0) ? "active" : "inactive"}
                key={`mastery${j}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: j + 2,
                  display: "grid",
                  "& > *": { gridArea: "1 / 1" },
                  p: 0.5,
                  minWidth: 0,
                }}
                onClick={() => onChange(changeMastery(op, i, j))}
                disabled={disabled}
              >
                <Image
                  width="32px"
                  height="32px"
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Image
                  width="32px"
                  height="32px"
                  src={`/img/rank/m-${j}.png`}
                  alt={`Mastery ${j}`}
                />
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  )
})
export default Mastery;