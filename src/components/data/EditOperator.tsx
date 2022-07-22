import React, { useEffect } from "react";
import { Operator } from "../../types/operator";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Slide, Typography, useMediaQuery, useTheme } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import changeOperator from "../../util/changeOperator";
import useLocalStorage from "../../util/useLocalStorage";
import EditRow from "./EditRow";
import General from "./EditPieces/General";
import Potential from "./EditPieces/Potential";
import Promotion from "./EditPieces/Promotion";
import Mastery from "./EditPieces/Mastery";
import Module from "./EditPieces/Module";

interface Props {
  opId: string;
  onClose: () => void;
}

const EditOperator = React.memo((props: Props) => {
  const { opId, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));


  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>("operators", {});
  const op = operators[opId];
  if (!op) return <></>

  const onChange = (operatorID: string, property: string, value: number | boolean, index?: number) => {
    if (isNaN(value as any)) {
      return;
    }
    setOperators(
      (oldOperators: Record<string, Operator>): Record<string, Operator> => {
        const copyOperators = { ...oldOperators };
        const copyOperatorData = { ...copyOperators[operatorID] };
        copyOperators[operatorID] = changeOperator(copyOperatorData, property, value, index);
        return copyOperators;
      }
    );
  }

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
      component="h5"
      variant="h2"
      sx={{
        marginLeft: "8px",
        paddingTop: "12px",
      }}>
      <Typography
        component="h5"
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
          childrenR={<Potential op={op} onChange={onChange} />}
        />
        <EditRow
          titleL="Skill Rank"
          titleR="Masteries"
          childrenL={<General op={op} onChange={onChange} />}
          childrenR={<Mastery op={op} onChange={onChange} />}
        />
        <EditRow
          titleR="Modules"
          childrenR={<Module op={op} onChange={onChange} />}
        />
      </DialogContent>
    </Dialog>
  );
});
export default EditOperator;
