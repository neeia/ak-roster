import React from "react";
import { Operator, OpJsonModule, OpJsonObj } from "../../../types/operator";
import { Box, Button, IconButton, Typography } from "@mui/material";
import operatorJson from "../../../data/operators.json";
import { MODULE_REQ_BY_RARITY } from "../../../util/changeOperator";

interface Props {
  op: Operator;
  onChange: (
    operatorId: string,
    property: string,
    value: number,
    index: number
  ) => void;
}
const Module = ((props: Props) => {
  const { op, onChange } = props;
  const opInfo: OpJsonObj = operatorJson[op.id as keyof typeof operatorJson];

  // returns whether an operator has a skill of the given number
  const hasSkill = (skill: number) => {
    switch (skill) {
      case 0:
        return op.rarity > 2;
      case 1:
        return op.rarity > 3;
      case 2:
        return op.rarity === 6 || op.name === "Amiya";
      default: return undefined;
    }
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "4px",
    }}>
      {opInfo.modules.map((module: OpJsonModule, i: number) => {
        const disabled = !op.owned || op.level < MODULE_REQ_BY_RARITY[op.rarity] || op.promotion < 2;
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
              {module.moduleName}
            </Typography>
            {opInfo !== undefined
              ?
              <Box sx={{ gridArea: "icon", display: "flex", flexDirection: "column" }}>
                <Box
                  component="img"
                  width="48px"
                  src={`/img/equip/${module.moduleId}.png`}
                  alt={`Module ${i + 1}`}
                />
                {module.typeName}
              </Box>
              : ""}
            {[...Array(4)].map((_, j) =>
              <Button
                key={`mastery${j}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: j + 2,
                  display: "grid",
                  p: 0.5,
                  minWidth: 0,
                  border: (op.mastery ?? [])[i] === j ? "" : ""
                }}
                onClick={() => onChange(op.id, "mastery", j, i)}
                disabled={disabled}
              >
                <Box
                  sx={{ gridArea: "1 / 1" }}
                  component="img"
                  width="32px"
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Box
                  sx={{ gridArea: "1 / 1" }}
                  component="img"
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
export default Module;