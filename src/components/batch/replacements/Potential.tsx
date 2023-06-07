import { Operator } from "types/operator";
import { Box, IconButton } from "@mui/material";
import { changePotential, getMaxPotentialById } from "util/changeOperator";
import Image from "next/image";

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
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      borderRadius: 1,
      width: "fit-content",
      mx: "auto",
      boxShadow: +op.owned,
      "& .MuiButtonBase-root": {
        boxShadow: 0,
      },
    }}>
      {[...Array(getMaxPotentialById(op.op_id))].map((_, i) =>
        <IconButton
          sx={{
            borderRadius: br(op.op_id, i),
          }}
          className={op.potential === i + 1 ? "active" : "inactive"}
          onClick={() => onChange(changePotential(op, i + 1))}
          disabled={!op.owned}
          key={`pot${i + 1}`}
        >
          <Box sx={{
            width: "32px",
            height: "32px",
            position: "relative",
          }}>
            <Image
              layout="fill"
              src={`/img/potential/${i + 1}.png`}
              alt={`Potential ${i + 1}`}
            />
          </Box>
        </IconButton>
      )}
    </Box>
  )
})
export default Potential;