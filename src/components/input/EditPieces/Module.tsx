import React from "react";
import { Operator, OpJsonModule, OpJsonObj } from "../../../types/operator";
import operatorJson from "../../../data/operators.json";
import { Box, Button, Typography } from "@mui/material";
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
                mb: -0.25,
                zIndex: 1
              }}>
              {module.moduleName}
            </Typography>
            <Box sx={{ gridArea: "icon", display: "flex", flexDirection: "column", alignItems: "center", }}>
              <Box
                className={disabled ? "Mui-disabled" : ""}
                component="img"
                width="48px"
                src={`/img/equip/${module.moduleId}.png`}
                alt={`Module ${i + 1}`}
              />
              <Typography
                variant="caption3"
                sx={{
                  mb: -0.25,
                  zIndex: 1
                }}>
                {module.typeName}
              </Typography>
            </Box>
            {[...Array(4)].map((_, j) =>
              <Button
                className={!disabled && (op.module && op.module[i] ? op.module[i] === j : j === 0) ? "active" : "inactive"}
                key={`mod${j}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: j + 2,
                  display: "grid",
                  p: 0.5,
                  minWidth: 0,
                  backgroundColor: "background.default",
                }}
                onClick={() => onChange(op.id, "module", j, i)}
                disabled={disabled}
              >
                <img
                  width="32px"
                  src={`/img/equip/img_stg${j}.png`}
                  alt={`Module ${j}`}
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