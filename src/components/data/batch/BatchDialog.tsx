import React, { memo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  Edit,
  FormatPaint,
  FormatPaintOutlined,
} from "@mui/icons-material";
import PresetSelector from "./PresetSelector";

interface Props {
  preset: string;
  editOpen: () => void;
  selectPreset: (p: string) => void;
  applyPreset: () => void;
}
const BatchDialog = memo((props: Props) => {
  const { preset, editOpen, selectPreset, applyPreset } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip title="Batch Edit" arrow describeChild>
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
          aria-label="Open Batch Options"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <FormatPaintOutlined fontSize="large" color="primary" />
          <Typography
            variant="caption"
            sx={{ display: { sm: "none" }, lineHeight: 1.1 }}
          >
            Batch
          </Typography>
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        keepMounted
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "12px",
          }}
        >
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}
          >
            Presets
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ display: { sm: "none" } }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            "& .inactive": {
              opacity: 0.9,
              py: "0.6rem",
            },
            "& .active": {
              opacity: 1,
              boxShadow: 0,
              pt: "0.6rem",
              borderBottomWidth: "0.25rem",
              borderBottomColor: "primary.main",
              borderBottomStyle: "solid",
              backgroundColor: "info.light",
            },
            "& .MuiButtonBase-root": {
              border: "unset",
            },
            "& .MuiButton-root, .MuiIconButton-root": {
              boxShadow: 2,
              backgroundColor: "info.main",
              height: "100%",
              width: "100%",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px 6px",
              maxWidth: "sm",
            }}
          >
            Select Preset
            <Box
              sx={{
                display: "grid",
                gridArea: "box",
                gridTemplateColumns: {
                  xs: "repeat(3, 1fr)",
                  sm: "repeat(6, 1fr)",
                },
                justifyContent: "center",
                gap: { xs: 0.5, sm: 1 },
                margin: 0,
                padding: 0,
                "& .MuiTypography-root": {
                  color: "text.primary",
                  letterSpacing: "normal",
                  textTransform: "none",
                  pointerEvents: "none",
                },
                "& .MuiButton-root": {
                  boxShadow: 2,
                  backgroundColor: { xs: "info.dark", sm: "info.main" },
                  height: "100%",
                  width: "100%",
                },
                "& .selected": {
                  opacity: 1,
                  boxShadow: 0,
                  borderBottomWidth: "0.25rem",
                  borderBottomColor: "primary.main",
                  borderBottomStyle: "solid",
                  backgroundColor: "info.light",
                },
              }}
            >
              <PresetSelector onClick={selectPreset} selectedPreset={preset} />
            </Box>
            <Box
              sx={{
                display: "grid",
                gridArea: "box",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gridTemplateRows: "min-content",
                justifyContent: "center",
                gap: { xs: 0.5, sm: 1 },
                margin: 0,
                padding: 0,
                "& .MuiButton-root": {
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 2,
                  backgroundColor: "info.main",
                  height: "100%",
                  width: "100%",
                },
              }}
            >
              <Button disabled={!preset} onClick={editOpen}>
                <Edit fontSize="large" />
                Edit
              </Button>
              <Button
                disabled={!preset}
                onClick={() => {
                  applyPreset();
                  setOpen(false);
                }}
              >
                <FormatPaint fontSize="large" />
                Apply
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
});
BatchDialog.displayName = "FilterDialog";
export default BatchDialog;
