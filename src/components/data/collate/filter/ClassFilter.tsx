import { Box, Divider, IconButton } from "@mui/material";
import React from "react";

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

const br = (index: number) => {
  const r = 4;
  if (index === 0) return `${r}px 0px 0px ${r}px`;
  else if (index === classList.length) return `0px ${r}px ${r}px 0px`;
  else return "0";
}

const bm = (index: number) => {
  const r = 4;
  if (index === 0) return `${r}px 0px 0px 0px`;
  else if (index === 3) return `0px ${r}px 0px 0px`;
  else if (index === 4) return `0px 0px 0px ${r}px`;
  else if (index === classList.length) return `0px 0px ${r}px 0px`;
  else return "0";
}

interface Props {
  activeClasses: string[];
  setClassFilter: (value: string) => void;
}

const ClassFilter = (props: Props) => {
  const { activeClasses, setClassFilter } = props;


  return (
    <>
      <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
        Class
      </Divider>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" }, width: "100%" }}>
        {classList.map((cl, i) => (
          <IconButton
            key={cl}
            className={activeClasses.includes(cl) ? "active" : "inactive"}
            sx={{ borderRadius: { xs: bm(i), sm: br(i) } }}
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