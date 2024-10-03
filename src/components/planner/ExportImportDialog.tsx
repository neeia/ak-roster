import { Alert, Button, Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, MenuItem, Select, SelectChangeEvent, Snackbar, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React, { useState } from "react";
import { Close, ContentCopy, FileUpload, InfoOutlined } from "@mui/icons-material";
import { exportToString, importFromString, SUPPORTED_EXPORT_TYPES, SUPPORTED_IMPORT_TYPES } from "../../util/exportImportHelper";
import { useDepotGetQuery, useDepotUpdateMutation } from "../../store/extendDepot";
import { useGoalsGetQuery } from "../../store/extendGoals";
import { DepotDataInsert } from "../../types/depotData";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ExportImportDialog = (props: Props) => {
  const { open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [exportFormat, setExportFormat] = useState("");
  const [importFormat, setImportFormat] = useState("");
  const [copiedSuccessfully, setCopiedSuccessfully] = useState(false);
  const [exportData, setExportData] = React.useState("");
  const [importData, setImportData] = React.useState("");
  const [importFinished, setImportFinished] = useState(false);
  const [importErrored, setImportErrored] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [fileList, setFileList] = useState<File[]>([]);

  const { data: goals } = useGoalsGetQuery();
  const { data: stock } = useDepotGetQuery();

  const [depotUpdateTrigger] = useDepotUpdateMutation();

  const handleExportFormatChange = (e: SelectChangeEvent) => {
    const selectedFormat = e.target.value;
    setExportFormat(selectedFormat);
    const data = exportToString(selectedFormat, goals ?? [], stock ?? {});
    setExportData(data);
  };

  const handleImportFormatChange = (e: SelectChangeEvent) => {
    const selectedFormat = e.target.value;
    setImportFormat(selectedFormat);
  };

  const handleImportData = async () => {
    if (importFormat == "Depot Recognition") {
      setImportMessage("Analyzing images");
      setImportErrored(false);
      setImportFinished(true);
    }
    const importStatus = await importFromString(importFormat, importData, fileList);

    if (importStatus.success) {
      const updatedDepot: DepotDataInsert[] = [];
      importStatus.data.forEach((payload) =>
        updatedDepot.push({
          material_id: payload.itemId,
          stock: payload.newQuantity,
        })
      );
      depotUpdateTrigger(updatedDepot);
      setImportMessage("Import successful");
      setImportErrored(false);
      setImportFinished(true);
    } else {
      setImportMessage(importStatus.errorMessage);
      setImportErrored(true);
      setImportFinished(true);
    }
  };

  const exportFormatOptions = () => {
    return SUPPORTED_EXPORT_TYPES.flatMap((x) => (
      <MenuItem key={x.format} value={x.format}>
        <Stack direction="row" alignItems="center" gap={1}>
          {x.format}
          <Tooltip title={x.description}>
            <InfoOutlined />
          </Tooltip>
        </Stack>
      </MenuItem>
    ));
  };

  const importFormatOptions = () => {
    return SUPPORTED_IMPORT_TYPES.flatMap((x) => (
      <MenuItem key={x.format} value={x.format}>
        <Stack direction="row" alignItems="center" gap={1}>
          {x.format}
          <Tooltip title={x.description}>
            <InfoOutlined />
          </Tooltip>
        </Stack>
      </MenuItem>
    ));
  };

  const handleClose = () => {
    setExportData("");
    setExportFormat("");
    setImportFormat("");
    setImportData("");
    setFileList([]);
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData).then();
    setCopiedSuccessfully(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputFiles = e.target.files;
    if (inputFiles != null && inputFiles.length > 0) {
      const files = [];
      for (let i = 0; i < inputFiles.length; i++) {
        files.push(inputFiles[i]);
      }
      const newFiles = files.filter((newFile) => !fileList.find((oldFiles) => oldFiles.name == newFile.name));
      setFileList([...fileList, ...newFiles]);
    }
  };

  const generateListForFiles = () => {
    const listItems = [];
    for (let i = 0; i < fileList.length; i++) {
      listItems.push(<ListItem key={fileList[i].name}>{fileList[i].name}</ListItem>);
    }
    return listItems;
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullScreen={fullScreen} keepMounted fullWidth maxWidth="md">
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
            Import/Export data
          </Typography>
          <IconButton onClick={() => onClose()} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1} mb={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="export-format-label">Export format</InputLabel>
                <Select
                  id="export-format"
                  variant="standard"
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
                    sx: { "& .MuiList-root": { mr: "25px", width: "100%" } },
                  }}
                  onChange={handleExportFormatChange}
                >
                  {exportFormatOptions()}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 8, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel id="import-format-label">Import format</InputLabel>
                <Select
                  id="import-format"
                  variant="standard"
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
                    sx: { "& .MuiList-root": { mr: "25px", width: "100%" } },
                  }}
                  onChange={handleImportFormatChange}
                >
                  {importFormatOptions()}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 4, md: 2 }}>
              <Tooltip title="Importing data OVERRIDE the current one">
                <span>
                  <Button variant="contained" color="primary" aria-label="Import data" startIcon={<FileUpload />} disabled={importData == "" && fileList.length == 0} onClick={handleImportData}>
                    Import data
                  </Button>
                </span>
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                minRows={10}
                maxRows={10}
                id="exported-data-input"
                label="Export data"
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end" sx={{ alignItems: "flex-end" }}>
                        <Tooltip title="Copy">
                          <span>
                            <IconButton aria-label="Copy exported data" onClick={copyToClipboard} edge="end" sx={{ mr: 0.1 }} disabled={exportData == ""}>
                              <ContentCopy />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </InputAdornment>
                    ),
                    sx: { alignItems: "flex-end" },
                  },
                }}
                value={exportData}
              ></TextField>
            </Grid>
            <Grid display="flex" justifyContent="center" alignItems="center" size={{ xs: 12, md: 6 }}>
              {importFormat == "Depot Recognition" ? (
                <Stack spacing={3}>
                  <Button variant="contained" color="primary" aria-label="upload picture" component="label">
                    Upload Image
                    <input hidden multiple accept="image/*" type="file" onChange={handleFileUpload} />
                    <FileUpload />
                  </Button>
                  <List sx={{ maxHeight: "10rem", overflow: "auto" }}>{generateListForFiles()}</List>
                </Stack>
              ) : (
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
                  }}
                ></TextField>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={copiedSuccessfully}
        autoHideDuration={1500}
        onClose={() => setCopiedSuccessfully(false)}
      >
        <Alert variant="filled" severity="success" onClose={() => setCopiedSuccessfully(false)}>
          Copied to clipboard
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={importFinished}
        autoHideDuration={1500}
        onClose={() => setImportFinished(false)}
      >
        <Alert variant="filled" severity={importErrored ? "error" : "success"} onClose={() => setImportFinished(false)}>
          {importMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

ExportImportDialog.displayName = "ExportImportDialog";
export default ExportImportDialog;
