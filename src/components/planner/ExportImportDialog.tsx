import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle, FormControl, Grid,
  IconButton, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, Stack, TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, {useState} from "react";
import {Close, ContentCopy, FileUpload, ImportExport, InfoOutlined} from "@mui/icons-material";
import {
  exportToString,
  importFromString,
  SUPPORTED_EXPORT_TYPES,
  SUPPORTED_IMPORT_TYPES
} from "../../util/exportImportHelper";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {selectGoals} from "../../store/goalsSlice";
import {selectStock, setStock} from "../../store/depotSlice";

const ExportImportDialog = () => {

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [exportFormat, setExportFormat] = useState("");
  const [importFormat, setImportFormat] = useState("");
  const [open, setOpen] = React.useState(false);
  const [copiedSuccessfully, setCopiedSuccessfully] = useState(false);
  const [exportData, setExportData] = React.useState("");
  const [importData, setImportData] = React.useState("");
  const [importFinished, setImportFinished] = useState(false);
  const [importErrored, setImportErrored] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const goals = useAppSelector(selectGoals);
  const stock = useAppSelector(selectStock);


  const handleExportFormatChange = (e: SelectChangeEvent<string>) => {
    const selectedFormat = e.target.value;
    setExportFormat(selectedFormat);
    const data = exportToString(selectedFormat, goals, stock);
    setExportData(data);
  };

  const handleImportFormatChange = (e: SelectChangeEvent<string>) => {
    const selectedFormat = e.target.value;
    setImportFormat(selectedFormat);
  };

  const handleImportData = () => {
    const importStatus = importFromString(importFormat, importData);
    if (importStatus.success)
    {
      importStatus.data.forEach(payload => dispatch(setStock(payload)))
      setImportMessage("Import successful");
      setImportErrored(false);
      setImportFinished(true);
    }
    else
    {
      setImportMessage(importStatus.errorMessage);
      setImportErrored(true);
      setImportFinished(true);
    }
  };

  const exportFormatOptions = () =>
  {
    return SUPPORTED_EXPORT_TYPES.flatMap(x => (
      <MenuItem key={x.format} value={x.format}>
        <Stack direction="row" alignItems="center" gap={1}>
          {x.format}
          <Tooltip title={x.description} >
            <InfoOutlined/>
          </Tooltip>
        </Stack>
      </MenuItem>
    ));
  }

  const importFormatOptions = () =>
  {
    return SUPPORTED_IMPORT_TYPES.flatMap(x => (
      <MenuItem key={x.format} value={x.format}>
        <Stack direction="row" alignItems="center" gap={1}>
          {x.format}
          <Tooltip title={x.description} >
            <InfoOutlined/>
          </Tooltip>
        </Stack>
      </MenuItem>
    ));
  }

  const handleClose = () => {
    setExportData("");
    setExportFormat("");
    setImportFormat("");
    setImportData("");
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
                  xs = {12}
                  md = {6}>
              <FormControl fullWidth>
                <InputLabel id="export-format-label">Export format</InputLabel>
                <Select
                  id="export-format"
                  name="export-format"
                  labelId="export-format-label"
                  label="Export format"
                  value={exportFormat}
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
                  onChange={handleExportFormatChange}
                >
                  {exportFormatOptions()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item
                  xs = {8}
                  md = {4}>
              <FormControl fullWidth>
                <InputLabel id="import-format-label">Import format</InputLabel>
                <Select
                  id="import-format"
                  name="import-format"
                  labelId="import-format-label"
                  label="import format"
                  value={importFormat}
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
                  onChange={handleImportFormatChange}
                >
                  {importFormatOptions()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item
                  xs={4}
                  md={2}>
              <Tooltip title="Importing data OVERRIDE the current one">
                <span>
                  <Button variant="outlined"
                          color="primary"
                          aria-label="Import data"
                          startIcon={<FileUpload/>}
                          disabled={importData == ""}
                          onClick={handleImportData}>
                    Import data
                  </Button>
                </span>
              </Tooltip>
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
                            <span>
                              <IconButton
                                          color="primary"
                                          aria-label="Copy exported data"
                                          onClick={copyToClipboard}
                                          edge="end"
                                          sx={{mr: 0.1}}
                                          disabled={exportData == ""}>
                                <ContentCopy/>
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>,
                    sx:{alignItems: 'flex-end'},
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
                value={importData}
                disabled={importFormat == ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setImportData(event.target.value);
                }}>
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
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={importFinished}
        autoHideDuration={1500}
        onClose={() => setImportFinished(false)}>
        <Alert variant="filled"
               severity={importErrored ? "error" : "success"}
               onClose={() => setImportFinished(false)} >
          {importMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

ExportImportDialog.displayName = "ExportImportDialog";
export default ExportImportDialog;