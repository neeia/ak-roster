import { Box, Divider, IconButton } from "@mui/material";
import React from "react";
import { Value } from "util/useFilter";

const classList = [
  "Vanguard",
  "Guard",
  "Defender",
  "Sniper",
  "Caster",
  "Medic",
  "Supporter",
  "Specialist",
]

interface Props {
  value: Set<Value>;
  onChange: (value: string) => void;
}

const ClassFilter = (props: Props) => {
  const { value: activeClasses, onChange: setClassFilter } = props;

  return (
    <>
      <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
        Class
      </Divider>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" }, width: "100%" }}>
        {classList.map((cl, i) => (
          <IconButton
            key={cl}
            className={activeClasses.has(cl) ? "active" : "inactive"}
            onClick={() => setClassFilter(cl)}
          >
            <Box
              component="img"
              width="2.5rem"
              src={`/img/classes/class_${cl.toLowerCase()}.png`}
              alt={cl}
            />
          </IconButton>
        ))}
      </Box >
    </>);
}

export default ClassFilter;