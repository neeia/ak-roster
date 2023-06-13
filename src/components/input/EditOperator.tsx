import React, { useEffect, useState } from "react";
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
import operatorJson from "data/operators";
import { useRosterUpsertMutation } from "store/extendRoster";

interface Props {
  op: Operator;
  open: boolean;
  onClose: () => void;
}

const EditOperator = React.memo((props: Props) => {
  const { op, open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  console.log("EditOperator received:")
  console.log(op)

  const [upsert, result] = useRosterUpsertMutation();

  const onChange = (o: Operator) => {
    upsert(o);
    // setLocal(o);
  }

  const opSkins: Skin[] = skinJson[op.op_id as keyof typeof skinJson];
  const opData = operatorJson[op.op_id];

  let intermediate = op.op_id;
  if (op?.elite === 2) {
    intermediate += "_2";
  } else if (op?.elite === 1 && opData.name === "Amiya") {
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
      {op.op_id in sg0
        ? <ExtLink href={`https://sanitygone.help/operators/${opData.name.toLowerCase().replace(/ /g, "-")}`} label="S;G" title="Sanity;Gone">
          <Image src={`/img/ext/sg0.png`} width={iconWidth} height={iconWidth} alt="" />
        </ExtLink>
        : null
      }
    </Box>
  )

  const editProps = { op: op, onChange };
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
          <Image src={imgUrl} fill sizes="(max-width: 600px) 64px, 96px" alt="" />
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
          left={{
            title: "General",
            body: <General {...editProps} />
          }}
          right={{
            title: "Potential",
            body: <Potential {...editProps} />
          }}
        />
        <EditRow
          left={{
            title: "Promotion",
            body: <Promotion {...editProps} />
          }}
          right={{
            title: "Level",
            body: <Level {...editProps} />
          }}
        />
        {opData?.skillData?.length
          ? <EditRow
            left={{
              title: "Skill Rank",
              body: <SkillLevel {...editProps} />
            }}
            right={opData.rarity > 3 ? {
              title: "Masteries",
              body: <Mastery {...editProps} />
            } : undefined}
          />
          : null
        }
        <EditRow
          left={opSkins && opSkins.length > 1 ? {
            title: "Outfits",
            body: <Skins {...editProps} />
          } : undefined}
          right={opData?.moduleData?.length ? {
            title: "Modules",
            body: <Module {...editProps} />
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
});
EditOperator.displayName = "EditOperator"
export default EditOperator;