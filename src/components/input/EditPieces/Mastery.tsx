import React from "react";
import { Operator, OpJsonObj } from "../../../types/operator";
import { Box, Button, IconButton, Typography } from "@mui/material";
import operatorJson from "../../../data/operators.json";
import { getNumSkills } from "../../../util/changeOperator";

interface Props {
  op: Operator;
  onChange: (
    operatorId: string,
    property: string,
    value: number,
    index: number
  ) => void;
}
const Mastery = ((props: Props) => {
  const { op, onChange } = props;
  const opInfo: OpJsonObj = operatorJson[op.id as keyof typeof operatorJson];

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "4px",
    }}>
      {[...Array(getNumSkills(op))].map((_, i) => {
        const disabled = !op.owned || op.skillLevel < 7 || op.promotion < 2;
        return (
          <Box
            key={`maB${i}`}
            sx={{
              display: "grid",
              gridTemplateAreas: `"icon name name name name"
                      "icon m m m m"`,
              gridTemplateColumns: `"auto repeat(4, 1fr)"`,
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
                onClick={() => onChange(op.id, "mastery", j, i)}
                disabled={disabled}
              >
                <Box component="img"
                  width="32px"
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Box component="img"
                  width="32px"
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