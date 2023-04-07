import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle, FormControl, Grid,
  IconButton, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, {useState} from "react";
import {Close, ContentCopy, ImportExport} from "@mui/icons-material";
import {exportToString, SUPPORTED_EXPORT_IMPORT_TYPES} from "../../util/exportImportHelper";
import {useAppSelector} from "../../store/hooks";
import {selectGoals} from "../../store/goalsSlice";
import {selectStock} from "../../store/depotSlice";

const ExportImportDialog = () => {

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [format, setFormat] = useState("");
  const [open, setOpen] = React.useState(false);
  const [copiedSuccessfully, setCopiedSuccessfully] = useState(false);
  const [exportData, setExportData] = React.useState("");
  const [importData, setImportData] = React.useState("");

  const goals = useAppSelector(selectGoals);
  const stock = useAppSelector(selectStock);


  const handleFormatChange = (e: SelectChangeEvent<string>) => {
    const selectedFormat = e.target.value;
    setFormat(selectedFormat);
    const data = exportToString(selectedFormat, goals, stock);
    setExportData(data);
  };

  const formatOptions = () =>
  {
    return SUPPORTED_EXPORT_IMPORT_TYPES.flatMap(x => (
      <MenuItem key={x} value={x}>
        {x}
      </MenuItem>
    ));
  }

  const handleClose = () => {
    setExportData("");
    setFormat("");
    setOpen(false)
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    setCopiedSuccessfully(true);
  };

  return (
    <>
      <Button
        color="primary"
        variant="contained"
        onClick={() => setOpen(!open)}
        startIcon={<ImportExport/>}
        aria-label="Import and export data"
        sx={{
          height: "100%",
          pl: 2,
        }}>
        Export/Import data
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        keepMounted
        fullWidth
        maxWidth="md">
        <DialogTitle sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "12px",
        }}>
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}>
            Import/Export data
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{display: {sm: "none"}}}>
            <Close/>
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          "& .MuiButtonBase-root": {
            boxShadow: 1,
            backgroundColor: "info.main",
          },
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
          "& .MuiButton-root, .MuiIconButton-root": {
            height: "3rem"
          }
        }}>
          <Grid container spacing={2} mt={1} mb={2}>
            <Grid item
                  xs = {12}>
              <FormControl fullWidth>
                <InputLabel id="export-format-label">Export format</InputLabel>
                <Select
                  id="export-format"
                  name="export-format"
                  labelId="export-format-label"
                  label="Export format"
                  value={format}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    sx: {"& .MuiList-root": {mr: "25px", width: "100%"}},
                  }}
                  onChange={handleFormatChange}
                >
                  {formatOptions()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item
                  xs = {12}
                  md = {6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={10}
                  maxRows={10}
                  id="exported-data-input"
                  label="Export data"
                  InputProps={{
                    readOnly: true,
                    endAdornment:
                        <InputAdornment position="end"
                                        sx={{alignItems: 'flex-end'}}>
                          <Tooltip title="Copy">
                              <IconButton
                                        color="primary"
                                        aria-label="Copy exported data"
                                        onClick={copyToClipboard}
                                        edge="end"
                                        sx={{mr: 0.1}}
                                        disabled={exportData == ""}>
                              <ContentCopy/>
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>,
                    sx:{alignItems: 'flex-end'}
                  }}
                  value={exportData}>
                </TextField>
            </Grid>
            <Grid item
                  xs = {12}
                  md = {6}>
              <TextField
                fullWidth
                multiline
                minRows={10}
                maxRows={10}
                id="import-data-input"
                label="Import data"
                value={importData}>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={copiedSuccessfully}
        autoHideDuration={1500}
        onClose={() => setCopiedSuccessfully(false)}>
        <Alert variant="filled"
               severity="success"
               onClose={() => setCopiedSuccessfully(false)} >
          Copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
}

ExportImportDialog.displayName = "ExportImportDialog";
export default ExportImportDialog;