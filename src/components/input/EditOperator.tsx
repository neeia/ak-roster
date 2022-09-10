import React from "react";
import { OpJsonObj } from "../../types/operator";
import operatorJson from "../../data/operators.json";
import sg0 from "../../data/sg0.json";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import EditRow from "./EditRow";
import General from "./EditPieces/General";
import Potential from "./EditPieces/Potential";
import Promotion from "./EditPieces/Promotion";
import Mastery from "./EditPieces/Mastery";
import Module from "./EditPieces/Module";
import Level from "./EditPieces/Level";
import SkillLevel from "./EditPieces/SkillLevel";
import useOperators from "../../util/useOperators";
import ExtLink from "./EditPieces/ExtLink";
import { Close } from "@mui/icons-material";

interface Props {
  opId: string;
  open: boolean;
  onClose: () => void;
}

const EditOperator = (props: Props) => {
  const { opId, open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [operators, onChange] = useOperators();

  const op = operators[opId];
  if (!op) return null;
  const opInfo: OpJsonObj = operatorJson[opId as keyof typeof operatorJson];

  let intermediate = opId;
  if (op.promotion === 2) {
    intermediate += "_2";
  } else if (op.promotion === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  const imgUrl = `/img/avatars/${intermediate}.png`;

  const opSplit = op.name.split(" the ");
  const name = (
    <Typography
      component="div"
      variant="h2"
      sx={{
        marginLeft: "8px",
        paddingTop: "12px",
      }}>
      <Box
        sx={{
          fontSize: {
            xs: "75%",
            sm: "100%"
          }
        }}>
        <Typography
          component="div"
          variant="h2"
          sx={{ fontSize: "50%", }}
        >
          {opSplit[1] ?? ""}
        </Typography>
        {opSplit[0]}
      </Box>
    </Typography>
  )

  const iconWidth = 20;
  const links = (
    <Box sx={{
      display: {
        xs: "none",
        sm: "flex"
      },
      flexDirection: "column"
    }}>
      <ExtLink href={`https://aceship.github.io/AN-EN-Tags/akhrchars.html?opname=${op.name}`} label="ACE" title="Aceship">
        <Box component="img" src={`/img/ext/aceship.png`} width={iconWidth} alt="" />
      </ExtLink>
      <ExtLink href={`https://gamepress.gg/arknights/operator/${op.name.replace(/( the )|[ !@#$%^&*(),.]/g, "-")}`} label="GP" title="Gamepress">
        <Box component="img" src={`/img/ext/gp.png`} width={iconWidth} alt="" />
      </ExtLink>
      <ExtLink href={`http://prts.wiki/w/${encodeURIComponent(opInfo.cnName)}`} label="PRTS">
        <Box component="img" src={`/img/ext/prts.png`} width={iconWidth} alt="" />
      </ExtLink>
      {opId in sg0
        ? <ExtLink href={`https://sanitygone.help/operators/${op.name.toLowerCase().replace(/ /g, "-")}`} label="S;G" title="Sanity;Gone">
          <Box component="img" src={`/img/ext/sg0.png`} width={iconWidth} alt="" />
        </ExtLink>
        : null
      }
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{
        alignSelf: "start",
        textAlign: "left",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        paddingBottom: "12px",
        boxShadow: {
          xs: 1,
          sm: 0
        },
      }}>
        <Box
          component="img"
          sx={{
            width: {
              xs: "4rem",
              sm: "6rem"
            }
          }}
          src={imgUrl}
          alt=""
        />
        {name}
        {links}
        <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <EditRow
          titleL="General"
          titleR="Potential"
          childrenL={<General op={op} onChange={onChange} />}
          childrenR={<Potential op={op} onChange={onChange} />}
        />
        <EditRow
          titleL="Promotion"
          titleR="Level"
          childrenL={<Promotion op={op} onChange={onChange} />}
          childrenR={<Level op={op} onChange={onChange} />}
        />
        {opInfo.skills.length !== 0
          ? <EditRow
            titleL="Skill Rank"
            titleR="Masteries"
            childrenL={<SkillLevel op={op} onChange={onChange} />}
            childrenR={<Mastery op={op} onChange={onChange} />}
          />
          : null
        }
        {opInfo.modules.length !== 0
          ? <EditRow
            titleR="Modules"
            childrenR={<Module op={op} onChange={onChange} />}
          />
          : null
        }
      </DialogContent>
    </Dialog>
  );
}
export default EditOperator;