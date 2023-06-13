import React from "react";
import { Operator } from "types/operator";
import { Box, IconButton, Tooltip } from "@mui/material";
import { changePotential, getMaxPotentialById } from "util/changeOperator";
import Image from "next/image";
import operatorJson from "data/operators";

const br = (op: string, pot: number) => {
  const r = 4;
  if (pot === 0) return `${r}px 0px 0px ${r}px`;
  else if (pot === getMaxPotentialById(op) - 1) return `0px ${r}px ${r}px 0px`;
  else return "0";
}

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const Potential = ((props: Props) => {
  const { op, onChange } = props;

  const potBonuses = operatorJson[op.op_id].potentials;
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      borderRadius: 1,
      width: "fit-content",
      mx: "auto",
      height: "48px",
      boxShadow: op.potential && 1,
      "& .MuiButtonBase-root": {
        boxShadow: "none !important",
      },
    }}>
      {[...Array(getMaxPotentialById(op.op_id))].map((_, i) =>
        <Tooltip title={i === 0 ? "Base" : potBonuses[i - 1]}
          arrow
          key={`pot${i + 1}`}
        >
          <span>
            <IconButton
              sx={{
                borderRadius: br(op.op_id, i),
              }}
              className={op.potential === i + 1 ? "active" : "inactive"}
              onClick={() => onChange(changePotential(op, i + 1))}
              disabled={!op.potential}
            >
              <Image
                width={32}
                height={32}
                src={`/img/potential/${i + 1}.png`}
                alt={`Potential ${i + 1}`}
              />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  )
})
export default Potential;