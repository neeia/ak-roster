import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
    useMediaQuery,
    Stack,
    Slide,
    IconButton,
    Button,
    Box,
    MenuItem,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    InputAdornment,
    Alert,
    Snackbar,
    DialogActions
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { ContentCopy, DragIndicator, FileUpload, InfoOutlined } from '@mui/icons-material';
import itemsJson from 'data/items.json';
import ItemBase from './ItemBase';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { TransitionProps } from '@mui/material/transitions';
import { Event, EventsData } from "types/localStorageSettings";
import InputIcon from '@mui/icons-material/Input';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import { Close } from "@mui/icons-material";
import { DataShareInfo } from 'util/fns/depot/exportImportHelper';
import { debounce } from 'lodash';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
    open: boolean;
    onClose: () => void;
    eventsData: EventsData;
    onChange: (data: EventsData) => void;
    openSummary: (state: boolean) => void;
    putDepot: (items: [string, number][]) => void;
}

const EventsTrackerDialog = React.memo((props: Props) => {
    const { open, onClose, eventsData, onChange, openSummary, putDepot } = props;

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [tab, setTab] = useState('input');
    const containerRef = useRef<HTMLElement>(null);

    const defaultEvent: Event = { index: 99, materials: {} };
    const [rawEvents, setRawEvents] = useState<EventsData>({});
    const [rawName, setRawName] = useState<string>('');
    const [newEventNames, setNewEventNames] = useState<Record<string, string>>({});

    const [copiedSuccessfully, setCopiedSuccessfully] = useState(false);
    const [exportFormat, setExportFormat] = useState('');
    const [importFormat, setImportFormat] = useState('');
    const [exportData, setExportData] = useState('');
    const [importData, setImportData] = useState('');

    const [importFinished, setImportFinished] = useState(false);
    const [importErrored, setImportErrored] = useState(false);
    const [importMessage, setImportMessage] = useState("");

    const [expandedAccordtition, setExpandedAccordtition] = useState<string | false>(false);

    const SUPPORTED_IMPORT_EXPORT_TYPES: DataShareInfo[] = [
        {
            format: "CSV",
            description: "A csv file containing 4 columns with the following names: eventName, index, material_id, quantity.",
        },
        {
            format: "JSON",
            description: 'JSON example: {"eventName": {"index": number, "materials": {["id": number]}}}}',
        },
    ];

    const MAX_SAFE_INTEGER = 2147483647;

    useEffect(() => {
        if (open) {
            setRawEvents(eventsData ?? {});
        }
    }, [open, eventsData])

    const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextTab: string) => {
        let toTab = nextTab;
        if (toTab === null) {
            switch (tab) {
                case "input": toTab = "importExport"
                    break;
                case "importExport": toTab = "input"
                    break;
            }
        }
        cleanImportExport();
        setTab(toTab);
    };

    const resetEventsList = () => {
        onChange({});
        setRawEvents({});
    }

    const saveToSettings = () => {
        onChange(rawEvents);
    }

    const handleClose = () => {
        setTab('input');
        onChange(rawEvents);

        setRawEvents(eventsData ?? {});
        setRawName("");

        setExpandedAccordtition(false);

        cleanImportExport();

        onClose();
    }

    //base function to debounce
    const handleEventNamesChange = () => {

        if (Object.keys(newEventNames).length === 0) return;

        setRawEvents((prev) => {
            const _next = { ...prev };
            Object.entries(newEventNames).forEach(([oldName, newName]) => {
                if (!newName.trim()) return;
                _next[newName] = { ..._next[oldName] };
                delete _next[oldName];
            });
            return _next;
        });
        setNewEventNames({});
    };

    //init ref with onChange
    const ref = useRef(handleEventNamesChange);

    //update ref on rawValues changes to see latest.
    useEffect(() => {
        ref.current = handleEventNamesChange;
    }, [newEventNames]);

    //creating debounced callback only once - on mount
    const debouncedEventNamesChange = useMemo(() => {
        const func = () => {
            ref.current?.(); //with access to latest onChange version from ref
        };
        return debounce(func, 1000);
    }, []);

    const handleEventNameChange = useCallback((oldName: string, newName: string) => {
        setNewEventNames(prev => ({ ...prev, [oldName]: newName }));
        debouncedEventNamesChange();
    }, [setNewEventNames, debouncedEventNamesChange]
    );

    const handleQuantityChange = (eventName: string, materialId: string, quantity: number) => {
        setRawEvents((prev) => {
            const _next = { ...prev };
            const _event = { ..._next[eventName] };
            if (quantity <= 0 || isNaN(quantity)) {
                delete _event.materials[materialId];
            } else {
                _event.materials[materialId] = Math.min(quantity, MAX_SAFE_INTEGER);
            }
            _next[eventName] = _event
            return _next;
        });
    };

    const itemBaseSize = useMemo(() => (40 * 0.7), []);

    const numberCSS = useMemo(() => ({
        component: "span",
        sx: {
            display: "inline-block",
            py: 0.25,
            px: 0.5,
            lineHeight: 1,
            mr: `${itemBaseSize / 16}px`,
            mb: `${itemBaseSize / 16}px`,
            alignSelf: "end",
            justifySelf: "end",
            backgroundColor: "background.paper",
            zIndex: 1,
            fontSize: `${itemBaseSize / 24 + 8}px`,
        },
    }), [itemBaseSize]);

    const reindexSortedEvents = (eventsArray: [string, Event][]) => {
        return eventsArray.reduce((acc, [name, data], idx) => {
            acc[name] = { ...data, index: idx };
            return acc;
        }, {} as EventsData);
    }

    const handleDragEnd = useCallback((result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const events = Object.entries(rawEvents).sort(
            ([, a], [, b]) => a.index - b.index
        );

        const [movedElement] = events.splice(source.index, 1);
        events.splice(destination.index, 0, movedElement);

        const reindexedData = reindexSortedEvents(events);

        setRawEvents(reindexedData);
    }, [rawEvents]
    );

    const addNewEvent = (name: string) => {
        const _name = name.trim();
        if (!_name) return;

        setRawEvents((prev) => {
            const _next = { ...prev ?? {} };
            const _newEvent = { ...defaultEvent };
            _newEvent.index = Object.keys(_next).length
            _next[_name] = _newEvent;
            return _next;
        }
        );
        setRawName('');
    }

    const handleDeleteEvent = useCallback((name: string) => {
        setRawEvents((prev) => {
            const _next = { ...prev };
            delete _next[name];
            return reindexSortedEvents(
                Object.entries(_next).sort(([, a], [, b]) => a.index - b.index))
        });
    }, []
    );

    const handlePutDepotAndDelete = useCallback((name: string) => {
        const _items = rawEvents[name]?.materials;
        if (_items) {
            putDepot(Object.entries(_items));
        }
        handleDeleteEvent(name);
    }, [rawEvents, putDepot, handleDeleteEvent]
    );

    const formatNumber = (num: number) => {
        return num < 1000
            ? num
            : num < 1000000
                ? `${num % 1000 === 0 ? `${num / 1000}` : (num / 1000).toFixed(1)}K`
                : `${num % 1000000 === 0 ? `${num / 1000000}` : (num / 1000000).toFixed(2)}M`;
    };

    const defaultMaterialsSet = useMemo(() =>
        Object.keys(itemsJson)
            .map((id) => itemsJson[id as keyof typeof itemsJson])
            .filter((item) => (
                ["Summary",
                    " Chip",
                    "Catalyst",
                    "LMD",
                    "Data "
                ]
                    .some((keyword) => item.name.includes(keyword)) ||
                Number(item.id) > 30000 && Number(item.id) < 32000) /* &&
                [3, 4, 5].includes(item.tier) */
            )
            .map((item) => item.id)
            .sort((idA, idB) => itemsJson[idA as keyof typeof itemsJson].sortId - itemsJson[idB as keyof typeof itemsJson].sortId)
        , []
    );

    const memoizedDetails = useMemo(() => {
        return defaultMaterialsSet.map((id) => (
            <Stack key={`${id}`} direction="row">
                <ItemBase key={`${id}-item`} itemId={id} size={itemBaseSize} sx={{ zIndex: 2 }} />
                <TextField
                    key={`${id}-input`}
                    onFocus={(e) => e.target.select()}
                    size="small"
                    sx={{ ml: -2.5, zIndex: 1 }}
                    type="number"
                    slotProps={{
                        htmlInput: {
                            type: "text",
                            sx: {
                                textAlign: "right",
                                width: "3ch",
                                flexGrow: 1,
                                color: "primary",
                                fontWeight: "normal",
                            },
                        },
                    }}
                />
            </Stack>
        ));
    }, [defaultMaterialsSet, itemBaseSize]);

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordtition(isExpanded ? panel : false);
    };
    const renderEvent = useCallback((name: string, index: number) => {
        const _eventData = rawEvents[name] ? { ...rawEvents[name] } : undefined;
        if (!_eventData) return (null);

        return (
            <Accordion key={name} expanded={expandedAccordtition === name} onChange={handleAccordionChange(name)} sx={{
                borderTop: "4px solid",
                borderColor: "primary.main",
            }}>
                <AccordionSummary>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" width="stretch">
                        <Stack direction="row" alignItems="center" flexWrap="nowrap">
                            <DragIndicator sx={{ mr: 1 }} />
                            <Stack direction="row" alignItems="center" flexWrap="wrap">
                                <TextField size="small" value={newEventNames[name] ?? name}
                                    sx={{
                                        mr: 2,
                                        width: { md: `${Math.max(10, (name.length) + 2)}ch`, xs: '100%' }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onChange={(e) => handleEventNameChange(name, e.target.value)} />
                                {/* <Stack direction="row" flexWrap="wrap"> */}
                                {Object.entries(_eventData.materials)
                                    .sort(([idA], [idB]) => itemsJson[idA as keyof typeof itemsJson].sortId - itemsJson[idB as keyof typeof itemsJson].sortId)
                                    .map(([id, quantity]) => (
                                        <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                            <Typography {...numberCSS}>{formatNumber(quantity)}</Typography>
                                        </ItemBase>
                                    ))}
                                {/* </Stack>  */}
                            </Stack>
                        </Stack>
                        <Stack direction="row" gap={2}>
                            <Tooltip title="Add to depot and delete">
                                <MoveToInboxIcon onClick={() => handlePutDepotAndDelete(name)} />
                            </Tooltip>
                            <DeleteIcon onClick={() => handleDeleteEvent(name)} />
                        </Stack>
                    </Stack>
                </AccordionSummary>
                {expandedAccordtition === name && (
                    <AccordionDetails style={{ display: 'flex', gap: 8 }}>
                        <Stack direction="row" style={{ width: '100%', flexWrap: 'wrap', gap: 8 }}>
                            {memoizedDetails.map((element) => {/*cloning existing elements for speed*/
                                const id = element.key?.toString().split('-')[0];
                                if (!id) return null;
                                return React.cloneElement(element, {
                                    children: React.Children.map(element.props.children, (child) => {
                                        if (React.isValidElement(child)) {
                                            return React.cloneElement(child as React.ReactElement<any>, {
                                                value: _eventData.materials[id] ?? 0,
                                                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleQuantityChange(name, id!, Number(e.target.value)),
                                                slotProps: {
                                                    htmlInput: {
                                                        type: "text",
                                                        sx: {
                                                            textAlign: "right",
                                                            width: "3ch",
                                                            flexGrow: 1,
                                                            color: (_eventData.materials[id] ?? 0) != 0 ? "primary" : "primary.contrastText",
                                                            fontWeight: (_eventData.materials[id] ?? 0) != 0 ? "bolder" : "normal",
                                                        },
                                                    },
                                                },
                                            });
                                        }
                                        return child;
                                    }),
                                });
                            })}
                        </Stack>
                    </AccordionDetails>
                )}
            </Accordion>
        )
    }, [rawEvents, newEventNames, expandedAccordtition, itemBaseSize, memoizedDetails, numberCSS,
        handleDeleteEvent, handlePutDepotAndDelete, handleEventNameChange]
    )
    const renderedEvents = useMemo(() => {
        return (
            <>
                {Object.keys(rawEvents).length > 0 ? (/* Render events list */
                    <>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="events">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ overflow: 'visible' }}>
                                        {Object.entries((rawEvents))
                                            .sort(([, aData], [, bData]) => aData.index - bData.index)
                                            .map(([groupName, data], index) => (
                                                <React.Fragment key={groupName}>
                                                    <Draggable key={groupName} draggableId={groupName} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {renderEvent(groupName, data.index)}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                </React.Fragment>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>
                ) : null}
            </>
        )
    }, [rawEvents, handleDragEnd, renderEvent]
    );

    const cleanImportExport = () => {
        setExportData("");
        setExportFormat("");
        setImportFormat("");
        setImportData("");
    }

    const importExportFormatOptions = () => {
        return SUPPORTED_IMPORT_EXPORT_TYPES.flatMap((x) => (
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

    // Handle Export
    const handleExportFormatChange = (e: SelectChangeEvent) => {
        const selectedFormat = e.target.value;
        setExportFormat(selectedFormat);
        let result = "";

        switch (selectedFormat) {
            case 'JSON':
                result = JSON.stringify(rawEvents, null, 2);
                break;
            case 'CSV':
                const csv = Object.entries(rawEvents)
                    .map(([name, eventData]) =>
                        Object.entries(eventData.materials).map(([material_id, quantity]) => `${name},${eventData.index},${material_id},${quantity}`).join('\n')
                    )
                    .join('\n');
                result = `eventName,index,material_id,quantity\n${csv}`;
                break;
        }
        setExportData(result);
    };

    const handleImportFormatChange = (e: SelectChangeEvent) => {
        const selectedFormat = e.target.value;
        setImportFormat(selectedFormat);
    };


    const copyToClipboard = () => {
        navigator.clipboard.writeText(exportData).then();
        setCopiedSuccessfully(true);
    };

    // Handle Import
    const handleImport = () => {
        try {
            let newData: EventsData = {};

            if (importFormat === 'JSON') {
                newData = JSON.parse(importData);
            } else {
                const lines = importData.split('\n').slice(1);
                lines.forEach(line => {
                    const [name, index, material_id, quantity] = line.split(',');
                    if (!newData[name]) newData[name] = { index: Number(index), materials: {} };
                    newData[name].materials[material_id] = Math.min(Number(quantity), MAX_SAFE_INTEGER)
                });
            };
            //remove trash data not from itemsJson
            const reindexedData = reindexSortedEvents(
                Object.entries(newData)
                    .filter(([, eData]) => {
                        //no mats event can exist
                        if (!eData.materials) return true;
                        //but all mats have to exist
                        return Object.entries(eData.materials)
                            .every(([id]) => (id in itemsJson))
                    })
                    .sort(([, eDataA], [, eDataB]) => (eDataA.index ?? 0) - (eDataB.index ?? 0)));

            setRawEvents(reindexedData);
            setImportMessage('Import successful');
            setImportErrored(false);
            setImportFinished(true);
        } catch (e) {
            setImportMessage('Error: Invalid import data');
            setImportErrored(true);
            setImportFinished(true);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                fullScreen={fullScreen}
                keepMounted fullWidth maxWidth="md">
                <DialogTitle
                    sx={{
                        display: "flex",
                        paddingBottom: "12px",
                    }}
                >
                    <ToggleButtonGroup
                        orientation="horizontal"
                        value={tab}
                        exclusive
                        onChange={handleToggleChange}
                    >
                        <ToggleButton value="input" aria-label="input">
                            <InputIcon />
                        </ToggleButton>
                        <ToggleButton value="importExport" aria-label="importExport">
                            <ImportExportIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    {(tab === "input") ? (!fullScreen? "Events Tracker" : "Events") : "Import/Export"}
                    <IconButton onClick={handleClose} sx={{ display: { sm: "none" }, gridArea: "close" }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{ height: { sm: '500px', xl: '700px' } }}
                    ref={containerRef}>
                    <Box sx={{ display: (tab === "input") ? "unset" : "none" }}>
                        {renderedEvents}
                        {/* Create new group */}
                        <Stack direction="row" gap={2} ml={2} mt={2} justifyContent="flex-start">
                            <TextField size="small" label="New Event Name" value={rawName} /* style={{ marginLeft: 'auto' }} */
                                onChange={(e) => setRawName(e.target.value)} />
                            <Button startIcon={<AddIcon />}
                                variant="contained" color="primary"
                                disabled={rawName.length === 0}
                                onClick={() => addNewEvent(rawName.trim())}>New Event</Button>
                        </Stack>
                    </Box>
                    <Box display={tab === 'importExport' ? "unset" : "none"}>
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
                                        {importExportFormatOptions()}
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
                                        {importExportFormatOptions()}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 4, md: 2 }}>
                                <Tooltip title="Importing data OVERRIDE the current one">
                                    <span>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            aria-label="Import data"
                                            startIcon={<FileUpload />}
                                            disabled={importData == ""}
                                            onClick={handleImport}
                                            sx={{ lineHeight: "1.3" }}
                                        >
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
                                                            <IconButton
                                                                aria-label="Copy exported data"
                                                                onClick={copyToClipboard}
                                                                edge="end"
                                                                sx={{ mr: 0.1 }}
                                                                disabled={exportData == ""}
                                                            >
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
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    gap: 1,
                    justifyContent: "space-between"
                }} >
                    <Button onClick={() => {
                        handleClose();
                        openSummary(true);
                    }}
                        variant="contained"
                        color="primary">
                        Open Summary
                    </Button>
                    {/*  <Button onClick={saveToNextUpdates}
                            variant="contained"
                            color="primary">
                            Save
                        </Button> */}
                    <Button onClick={resetEventsList}
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        disabled={tab === "input" ? false : true}
                        color="primary">
                        Reset
                    </Button>
                </DialogActions>
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
});

EventsTrackerDialog.displayName = "EventsTrackerDialog";
export default EventsTrackerDialog;
