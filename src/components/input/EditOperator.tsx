import React from "react";
import { Operator, OperatorData, Skin } from "types/operator";
import operatorJson from "data/operators.json";
import skinJson from "data/skins.json";
import sg0 from "data/sg0.json";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import EditRow from "./EditRow";
import General from "./EditPieces/General";
import Potential from "./EditPieces/Potential";
import Promotion from "./EditPieces/Promotion";
import Mastery from "./EditPieces/Mastery";
import Module from "./EditPieces/Module";
import Level from "./EditPieces/Level";
import SkillLevel from "./EditPieces/SkillLevel";
import ExtLink from "./EditPieces/ExtLink";
import { Close } from "@mui/icons-material";
import Skins from "./EditPieces/Skins";
import Image from "next/image";

interface Props {
  op?: Operator;
  onChange: (op: Operator) => void;
  open: boolean;
  onClose: () => void;
}

const EditOperator = React.memo((props: Props) => {
  const { op, onChange, open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!op) return null;
  const opId = op.id;
  const opSkins: Skin[] = skinJson[opId as keyof typeof skinJson];
  const opInfo: OperatorData = operatorJson[opId as keyof typeof operatorJson];

  let intermediate = opId;
  if (op.elite === 2) {
    intermediate += "_2";
  } else if (op.elite === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  const imgUrl = `/img/avatars/${op.skin ?? intermediate}.png`;

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
        <Image src={`/img/ext/aceship.png`} width={iconWidth} height={iconWidth} alt="" />
      </ExtLink>
      <ExtLink href={`https://gamepress.gg/arknights/operator/${op.name.replace(/( the )|[ !@#$%^&*(),.]/g, "-")}`} label="GP" title="Gamepress">
        <Image src={`/img/ext/gp.png`} width={iconWidth} height={iconWidth} alt="" />
      </ExtLink>
      <ExtLink href={`http://prts.wiki/w/${encodeURIComponent(opInfo.cnName)}`} label="PRTS">
        <Image src={`/img/ext/prts.png`} width={iconWidth} height={iconWidth} alt="" />
      </ExtLink>
      {opId in sg0
        ? <ExtLink href={`https://sanitygone.help/operators/${op.name.toLowerCase().replace(/ /g, "-")}`} label="S;G" title="Sanity;Gone">
          <Image src={`/img/ext/sg0.png`} width={iconWidth} height={iconWidth} alt="" />
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
        boxShadow: 1,
      }}>
        <Box
          sx={{
            height: {
              xs: "4rem",
              sm: "6rem"
            },
            width: {
              xs: "4rem",
              sm: "6rem"
            },
            position: "relative",
          }}
        >
          <Image src={imgUrl} layout="fill" alt="" />
        </Box>
        {name}
        {links}
        <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{
        "& .MuiButtonBase-root": {
          backgroundColor: "info.main",
          boxShadow: 1,
          transition: "background-color 0.1s",
          "&:hover": {
            backgroundColor: "rgba(255, 212, 64, 0.1)",
          }
        },
        "& .inactive": {
          opacity: 0.75,
        },
        "& .active": {
          opacity: 1,
          boxShadow: 0,
          borderBottomWidth: "0.25rem",
          borderBottomColor: "primary.main",
          borderBottomStyle: "solid",
          backgroundColor: "info.light",
        },
        "& .Mui-disabled": {
          opacity: 0.25,
          boxShadow: 0,
        },
      }}>
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
        <EditRow
          titleL={opSkins && opSkins.length > 1
            ? "Outfits"
            : undefined
          }
          titleR={opInfo.modules.length !== 0
            ? "Modules"
            : undefined
          }
          childrenL={opSkins && opSkins.length > 1
            ? <Skins op={op} onChange={onChange} />
            : undefined
          }
          childrenR={opInfo.modules.length !== 0
            ? <Module op={op} onChange={onChange} />
            : undefined
          }
        />
      </DialogContent>
    </Dialog>
  );
});
EditOperator.displayName = "EditOperator"
export default EditOperator;