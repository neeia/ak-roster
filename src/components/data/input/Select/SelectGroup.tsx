import { Box, BoxProps, Button, Typography } from "@mui/material";
import React from "react";
import Level from "./Level";
import General from "./General";
import Mastery from "./Mastery";
import Module from "./Module";
import Potential from "./Potential";
import Rarity from "./Rarity";
import FromTo from "./FromTo";
import Skins from "./Skins";
import SkillLevel from "./SkillLevel";
import Promotion from "./Promotion";
import attachSubComponents from "util/subcomponent";

interface Props extends Omit<BoxProps, "onClick"> {
  title?: string,
  label?: string;
  onClick?: () => void;
}

const SelectGroup = (props: Props) => {
  const { title, label, children, onClick, sx, ...rest } = props;

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "background.default",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        p: 2,
        ...sx
      }}
      {...rest}
    >
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Typography variant="h3">
          {title}
        </Typography>
        {label &&
          <Button variant="text" onClick={onClick} sx={{
            color: "text.secondary",
            p: 0,
          }}>
            {label}
          </Button>
        }
      </Box>
      {children}
    </Box>
  );
};

const Select = attachSubComponents("SelectGroup", SelectGroup, {
  General, Potential, Promotion, Level, 
})

export default Select;