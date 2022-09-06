import React from "react";
import { OpJsonObj } from "../../types/operator";
import sg0 from "../../data/sg0.json";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import EditRow from "../input/EditRow";
import General from "../input/EditPieces/General";
import Potential from "../input/EditPieces/Potential";
import Promotion from "../input/EditPieces/Promotion";
import Mastery from "./replacements/Mastery";
import Level from "../input/EditPieces/Level";
import SkillLevel from "../input/EditPieces/SkillLevel";
import usePresets from "../../util/usePresets";
import { Close } from "@mui/icons-material";

interface Props {
  presetID: string;
  open: boolean;
  onClose: () => void;
}

const EditPreset = React.memo((props: Props) => {
  const { presetID, open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [presets, onChange, rename] = usePresets();

  const preset = presets[presetID];
  if (!preset) return null;

  const name = (
    <TextField
      variant="outlined"
      size="small"
      margin="none"
      value={preset.name}
      onChange={e => rename(preset.id, e.target.value)}
      inputProps={{
        sx: {
          paddingTop: "12px",
          paddingBottom: "12px",
          fontSize: "24px",
          textAlign: "center",
        }
      }}
    />
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{
        alignSelf: "start",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        paddingBottom: "12px",
        boxShadow: {
          xs: 1,
          sm: 0
        },
      }}>
        {name}
        <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
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