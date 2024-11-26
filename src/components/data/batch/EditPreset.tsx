import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditRow from "../input/EditRow";
import General from "../input/Select/General";
import Potential from "./replacements/Potential";
import Promotion from "../input/Select/Promotion";
import Mastery from "./replacements/Mastery";
import Level from "../input/Select/Level";
import SkillLevel from "../input/Select/SkillLevel";
import { Close } from "@mui/icons-material";
import { Operator } from "types/operators/operator";

interface Props {
  preset: Operator;
  open: boolean;
  onClose: () => void;
  onChange: (op: Operator) => void;
  rename: (id: string, name: string) => void;
}

const EditPreset = React.memo((props: Props) => {
  const { preset, open, onClose, onChange, rename } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!preset) return null;

  const name = (
    <TextField
      variant="outlined"
      size="small"
      margin="none"
      value={preset.name}
      onChange={(e) => rename(preset.op_id, e.target.value)}
      inputProps={{
        sx: {
          paddingTop: "12px",
          paddingBottom: "12px",
          fontSize: "24px",
          textAlign: "center",
        },
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen}>
      <DialogTitle
        sx={{
          alignSelf: "start",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          paddingBottom: "12px",
          boxShadow: {
            xs: 1,
            sm: 0,
          },
        }}
      >
        {name}
        <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          "& .MuiButtonBase-root": {
            border: "unset",
            backgroundColor: "info.main",
            boxShadow: 1,
          },
          "& .inactive": {
            opacity: 0.75,
          },
          "& .active": {
            opacity: 1,
            boxShadow: 0,
            borderBottomWidth: "0.25rem 0px 0px 0px !important",
            borderBottomColor: "primary.main",
            borderBottomStyle: "solid",
            backgroundColor: "info.light",
          },
          "& .Mui-disabled": {
            opacity: 0.25,
            boxShadow: 0,
          },
        }}
      >
        <EditRow
          titleL="General"
          titleR="Potential"
          childrenL={<General op={preset} onChange={onChange} />}
          childrenR={<Potential op={preset} onChange={onChange} />}
        />
        <EditRow
          titleL="Promotion"
          titleR="Level"
          childrenL={<Promotion op={preset} onChange={onChange} />}
          childrenR={<Level op={preset} onChange={onChange} />}
        />
        <EditRow
          titleL="Skill Rank"
          titleR="Masteries"
          childrenL={<SkillLevel op={preset} onChange={onChange} />}
          childrenR={<Mastery op={preset} onChange={onChange} />}
        />
      </DialogContent>
    </Dialog>
  );
});
EditPreset.displayName = "EditOperator";
export default EditPreset;
