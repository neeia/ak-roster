import React, { useEffect } from "react";
import { defaultOperatorObject, LegacyOperator, Operator, OpJsonModule, OpJsonObj } from "../../types/operator";
import operatorJson from "../../data/operators.json";
import { Box, Dialog, DialogContent, DialogTitle, Typography, useMediaQuery, useTheme } from "@mui/material";
import EditRow from "./EditRow";
import General from "./EditPieces/General";
import Potential from "./EditPieces/Potential";
import Promotion from "./EditPieces/Promotion";
import Mastery from "./EditPieces/Mastery";
import Module from "./EditPieces/Module";
import Level from "./EditPieces/Level";
import SkillLevel from "./EditPieces/SkillLevel";
import useOperators from "../../util/useOperators";


interface Props {
  opId: string;
  onClose: () => void;
}

const EditOperator = ((props: Props) => {
  const { opId, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [operators, onChange, applyBatch] = useOperators();

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
      <Typography
        component="div"
        variant="h2"
        sx={{ fontSize: "50%", }}
      >
        {opSplit[1] ?? ""}
      </Typography>
      {opSplit[0]}
    </Typography>
  )

  return (
    <Dialog
      open={opId !== ""}
      onClose={onClose}
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{
        alignSelf: "start",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        paddingBottom: "12px",
      }}>
        <Box
          component="img"
          width="6rem"
          src={imgUrl}
          alt=""
        />
        {name}
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
});
export default EditOperator;