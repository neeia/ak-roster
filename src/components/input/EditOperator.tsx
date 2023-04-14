import React from "react";
import { Operator, OperatorData, OperatorId, Skin } from "types/operator";
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
import { selectOperator, updateOperator } from "store/rosterSlice";
import { useAppDispatch, useAppSelector } from "store/hooks";
import operatorJson from "data/operators";
import { defaultOperatorObject } from "util/changeOperator";

interface Props {
  opId?: OperatorId;
  open: boolean;
  onClose: () => void;
}

const EditOperator = React.memo((props: Props) => {
  const { opId, open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();

  const onChange = (op: Operator) => {
    dispatch(updateOperator(op));
  }
  const op = useAppSelector(selectOperator(opId));

  if (!opId) return null;
  const opSkins: Skin[] = skinJson[opId as keyof typeof skinJson];
  const opData = operatorJson[opId];

  let intermediate = opId;
  if (op?.promotion === 2) {
    intermediate += "_2";
  } else if (op?.promotion === 1 && opData.name === "Amiya") {
    intermediate += "_1";
  }
  const imgUrl = `/img/avatars/${op?.skin ?? intermediate}.png`;

  const opSplit = opData.name.split(" the ");
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
      <ExtLink href={`https://aceship.github.io/AN-EN-Tags/akhrchars.html?opname=${opData.name}`} label="ACE" title="Aceship">
        <Image src={`/img/ext/aceship.png`} width={iconWidth} height={iconWidth} alt="" />
      </ExtLink>
      <ExtLink href={`https://gamepress.gg/arknights/operator/${opData.name.replace(/( the )|[ !@#$%^&*(),.]/g, "-")}`} label="GP" title="Gamepress">
        <Image src={`/img/ext/gp.png`} width={iconWidth} height={iconWidth} alt="" />
      </ExtLink>
      <ExtLink href={`http://prts.wiki/w/${encodeURIComponent(opData.cnName)}`} label="PRTS" title="PRTS Wiki">
        <Image src={`/img/ext/prts.png`} width={iconWidth} height={iconWidth} alt="" />
      </ExtLink>
      {opId in sg0
        ? <ExtLink href={`https://sanitygone.help/operators/${opData.name.toLowerCase().replace(/ /g, "-")}`} label="S;G" title="Sanity;Gone">
          <Image src={`/img/ext/sg0.png`} width={iconWidth} height={iconWidth} alt="" />
        </ExtLink>
        : null
      }
    </Box>
  )


  const editProps = { op: op!, onChange };
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
          childrenL={<General {...editProps} />}
          childrenR={<Potential {...editProps} />}
        />
        <EditRow
          titleL="Promotion"
          titleR="Level"
          childrenL={<Promotion {...editProps} />}
          childrenR={<Level {...editProps} />}
        />
        {opData.skillData.length !== 0
          ? <EditRow
            titleL="Skill Rank"
            titleR="Masteries"
            childrenL={<SkillLevel  {...editProps} />}
            childrenR={<Mastery  {...editProps} />}
          />
          : null
        }
        <EditRow
          titleL={opSkins && opSkins.length > 1
            ? "Outfits"
            : undefined
          }
          titleR={opData.moduleData.length !== 0
            ? "Modules"
            : undefined
          }
          childrenL={opSkins && opSkins.length > 1
            ? <Skins {...editProps} />
            : undefined
          }
          childrenR={opData.moduleData.length !== 0
            ? <Module  {...editProps} />
            : undefined
          }
        />
      </DialogContent>
    </Dialog>
  );
});
EditOperator.displayName = "EditOperator"
export default EditOperator;