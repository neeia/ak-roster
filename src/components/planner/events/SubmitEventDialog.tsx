import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { NamedEvent, EventsData, SubmitEventProps, EventsSelectorProps, WebEvent, TrackerDefaults, SubmitSource } from "types/events";
import EventsSelector from "./EventsSelector";
import { formatNumber, getWidthFromValue, standardItemsSort, getItemBaseStyling } from "util/fns/depot/itemUtils"
import ItemEditBox from "./ItemEditBox";
import useEvents from "util/hooks/useEvents";
import { createEmptyEvent, createEmptyNamedEvent, getEventsFromWebEvents } from "util/fns/eventUtils";

interface Props {
    open: boolean;
    onClose: () => void;
    allowedSources?: (EventsSelectorProps['dataType'] | 'current' | 'currentWeb')[];
    onSubmit: (submit: SubmitEventProps) => void;
    eventsData: EventsData;
    trackerDefaults: TrackerDefaults;
    submitedEvent: NamedEvent | WebEvent;
    selectedEvent?: NamedEvent;
    onSelectorChange?: (namedEvent: NamedEvent) => void
}

const SubmitEventDialog = (props: Props) => {
    const { open, onClose, allowedSources, onSubmit, eventsData, trackerDefaults, submitedEvent, selectedEvent, onSelectorChange } = props;

    const [rawMaterials, setRawMaterials] = useState<Record<string, number>>({});
    const [rawFarms, setRawFarms] = useState<string[]>([]);
    const [rawName, setRawName] = useState<string>('');
    const [isNumbersMatch, setIsNumbersMatch] = useState<boolean>(true);
    const [focused, setFocused] = useState<string | false>(false);
    const [modesList, setModesList] = useState<SubmitEventProps['action'][]>([]);
    const [mode, setMode] = useState<SubmitEventProps['action']>();
    const [source, setSource] = useState<EventsSelectorProps['dataType'] | 'current' | 'currentWeb'>('current');

    const [selectedFrom, setSelectedFrom] = useState<NamedEvent>(createEmptyNamedEvent());

    const resetFormOnUnselected = () => {
        setSelectedFrom(createEmptyNamedEvent());
        setRawMaterials({});
        setRawFarms([]);
        setRawName('')
        setIsNumbersMatch(false);
        setFocused(false);
    }

    const setFormToSubmited = useCallback(() => {
        setRawMaterials(submitedEvent.materials ?? {});
        setRawFarms(submitedEvent?.farms ?? []);
        setRawName(submitedEvent?.name ?? '');
        setIsNumbersMatch(true);
        setFocused(false);
    }, [submitedEvent]
    );

    const switchSource = useCallback((next?: SubmitSource) => {

        if (next !== undefined) {
            setSource(next);
            return;
        }
        if (!allowedSources || allowedSources.length === 1) return;

        const list = allowedSources;
        setSource((prev) => {
            let result: SubmitSource;

            const idx = list.indexOf(prev) + 1;
            result = idx < list.length ? list[idx] : list[0];

            if (!result.includes("current"))
                resetFormOnUnselected();
            else
                setFormToSubmited();
            return result;
        })
    }, [allowedSources, setFormToSubmited]
    );

    useEffect(() => {
        if (!open) return;
        setFormToSubmited();
        let _source = allowedSources?.[0];
        if (!_source) {
            _source = ('pageName' in submitedEvent)
                ? 'currentWeb'
                : 'current';
        }
        switchSource(_source);

    }, [open]);

    useEffect(() => {
        const _modes: SubmitEventProps['action'][] = [];
        if (!open) return;
        if ((selectedEvent?.index ?? -1) === -1) {
            /* if (selectedFrom.index === -1) { */
            if ('pageName' in submitedEvent || !source.includes("current"))
                _modes.push("create");
            else
                _modes.push("modify", "remove");
            /* } */
        } else {
            _modes.push("modify", "replace");

        }
        setModesList(_modes);
        setMode(_modes[0]);
    }, [open, selectedEvent, selectedFrom, source, submitedEvent]
    );

    const switchMode = () => {
        setMode((prev) => {
            const idx = prev ? modesList.indexOf(prev) + 1 : 0;
            const next = idx < modesList.length ? modesList[idx] : modesList[0];
            if (!next) return prev;
            return next;
        })
    }

    const materialsLimit = useMemo(() => {
        return source.includes("current") ? submitedEvent.materials : selectedFrom.materials;
    }, [source, selectedFrom, submitedEvent])

    const handleFromSelectorChange = (event: NamedEvent) => {
        setSelectedFrom(event);
        setRawMaterials(event.materials);
        setRawFarms(event.farms ?? [])
        setRawName(event.name);
    };
    //-

    const handleEventsSelectorChange = (event: NamedEvent) => {
        onSelectorChange?.(event);
    }

    const handleInputChange = (id: string, value: number) => {

        setRawMaterials((prev) => {
            const newValue = Math.max(0, Math.min(value || 0, materialsLimit?.[id] ?? 0));
            const updated = { ...prev, [id]: newValue };

            const allValuesMatch = Object.entries(updated).every(
                ([key, val]) => val === (materialsLimit?.[key] ?? 0)
            );
            setIsNumbersMatch(allValuesMatch);
            return updated;
        });
    };

    //stale data hooks 
    const { getNextMonthsData } = useEvents();

    const getSourceData = (source: SubmitSource): EventsData => {
        switch (source) {
            case 'months': return getNextMonthsData();
            case 'events': return eventsData;
            case 'defaults': return trackerDefaults.eventsData ?? {};
            case 'defaultsWeb': return getEventsFromWebEvents(trackerDefaults.webEventsData ?? {});
            default: return eventsData;
        }
    }

    const getSourceName = (source: SubmitSource) => {
        switch (source) {
            case "current": return "Current event";
            case "currentWeb": return "Selected web event";
            case "events": return "Events in Tracker";
            case "months": return "Months generator";
            case "defaults": return "Defaut event list";
            case "defaultsWeb": return "CN prts.wiki data";
            default: return '';
        }
    }

    const handleDialogClose = useCallback(() => {
        resetFormOnUnselected();
        onClose();
    }, [onClose]
    );

    const handleSubmit = useCallback(() => {
        let {
            targetName,
            sourceName,
            targetEventIndex,
            materialsToDepot,
            materialsToEvent,
            farms,
            action
        }: SubmitEventProps = {
            targetName: submitedEvent.name ?? "",
            sourceName: null,
            targetEventIndex: selectedEvent?.index ?? -1,
            materialsToDepot: [],
            materialsToEvent: false,
            farms: rawFarms,
            action: mode ? mode : "replace",
        };

        const _submitedMaterialsArray =
            Object.entries(rawMaterials ?? {})
                .filter(([_, quantity]) => quantity > 0);

        const _materialsLeftArray = (!isNumbersMatch && submitedEvent.materials)
            ? Object.entries(submitedEvent.materials)
                .map(([id, quantity]) => ([id, quantity - (rawMaterials[id] ?? 0)] as [string, number]))
                .filter(([_, quantity]) => quantity > 0)
            : false;

        targetName = rawName !== "" ? rawName : targetName;

        switch (mode) {
            case "create": {
                /* targetName = rawName !== "" ? rawName : targetName; */
                materialsToEvent = Object.fromEntries(_submitedMaterialsArray);
            }
                break;
            case "remove": {//case of event to depot 
                materialsToDepot = _submitedMaterialsArray;
            }
                break;
            case "modify": {
                if (source === 'current' && ((selectedEvent?.index ?? -1) === -1)) {//case of event to depot
                    materialsToDepot = _submitedMaterialsArray;
                    materialsToEvent = _materialsLeftArray ? Object.fromEntries(_materialsLeftArray) : _materialsLeftArray;
                }
                else {//any other case into target event
                    materialsToEvent = Object.fromEntries(_submitedMaterialsArray);
                    //target = targetEventIndex
                    sourceName = selectedFrom.index !== -1 ? selectedFrom.name : (submitedEvent?.name ?? null);
                }
                setSelectedFrom(createEmptyNamedEvent);
            }
                break;
            case "replace": {// replacing is only into selectedIntex
                materialsToEvent = Object.fromEntries(_submitedMaterialsArray);
                //target = targetEventIndex
                //source to remove - selectedFrom or submited event
                targetName = selectedFrom.index !== -1 ? selectedFrom.name : targetName;
                /* sourceName = (selectedEvent?.name ?? "");  */
                setSelectedFrom(createEmptyNamedEvent);
            }
                break;
        }

        onSubmit({
            targetName,
            sourceName,
            targetEventIndex,
            materialsToDepot,
            materialsToEvent,
            farms,
            action,
        });
        handleDialogClose();
    }, [handleDialogClose, mode, source, submitedEvent, isNumbersMatch, onSubmit, rawFarms, rawMaterials, rawName, selectedEvent, selectedFrom]
    );

    const isMaterialsEmpty = Object.values(rawMaterials).every((value) => value === 0);
    const isSubmitDisabled = isMaterialsEmpty || rawName === "";

    const handleClearAll = () => {
        setRawMaterials(prev => {
            const next = {} as typeof prev;
            if (!isMaterialsEmpty) {
                for (const id in prev) {
                    next[id] = 0;
                }
            } else {
                for (const id in prev) {
                    next[id] = materialsLimit?.[id] ?? 0;
                }
            }
            return next;
        });
    };

    return (
        <Dialog open={open} onClose={handleDialogClose}>
            <DialogTitle p={1} minHeight="170px">
                <Stack direction="column" width="100%" gap={1}>
                    <Stack direction="row">
                        From: <Button
                            variant="text"
                            onClick={() => switchSource()}
                        ><Typography variant="caption">{getSourceName(source)}</Typography></Button>
                    </Stack>
                    <Stack direction="row" alignItems="stretch">
                        {(source === "current" || source === "currentWeb")
                            ? <TextField
                                value={rawName}
                                /* disabled={(variant !== "builder")} */
                                onChange={(e) => {
                                    setRawName(e.target.value);
                                    /* if (rawName !== submitedEvent.name && rawName !== '') {
                                        setReplace(true);
                                    } else {
                                        setReplace(false);
                                    } */
                                }}
                                onFocus={(e) => e.target.select()}
                                size="small"
                                fullWidth
                                type="text"
                            />
                            : <EventsSelector
                                dataType={source}
                                eventsData={getSourceData(source)}
                                selectedEvent={selectedFrom}
                                onChange={handleFromSelectorChange}
                            />}
                        {mode && (<Button
                            variant="text"
                            onClick={switchMode}
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            {mode}
                        </Button>
                        )}
                    </Stack>
                </Stack>
            </DialogTitle>
            <DialogContent sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                minHeight: "200px",
                alignItems: "flex-start",
            }}>
                {Object.keys(rawMaterials).length > 0 && (
                    <Stack direction="row" gap={0.7} flexWrap="wrap" justifyContent="center">
                        {Object.entries(rawMaterials)
                            .sort(([a], [b]) => standardItemsSort(a, b))
                            .map(([id, quantity]) => (
                                <ItemEditBox
                                    key={`${id}-itemEdit`}
                                    itemId={id}
                                    size={getItemBaseStyling("submit").itemBaseSize}
                                    value={quantity !== 0 ? (focused !== id ? formatNumber(quantity) : quantity) : ""}
                                    width={getWidthFromValue(quantity !== 0 ? (focused !== id ? formatNumber(quantity) : quantity) : "")}
                                    onFocus={() => {
                                        setFocused(id);
                                    }}
                                    onChange={(value) => handleInputChange(id, value)}
                                    onIconClick={(id) => {
                                        setFocused(id)
                                    }}
                                />
                            ))}
                        <Button
                            variant="text"
                            onClick={handleClearAll}>
                            {isMaterialsEmpty ? "return all" : "clear all"}
                        </Button>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ flexDirection: { xs: "column", md: "row" }, gap: 1 }}>
                <EventsSelector
                    emptyItem={source === 'current' ? `Depot & ${mode} current event` : "New event"}
                    dataType={'events'}
                    eventsData={eventsData}
                    selectedEvent={selectedEvent ?? createEmptyEvent()}
                    onChange={handleEventsSelectorChange}
                />
                <Stack direction="row" gap={1}>
                    <Button disabled={isSubmitDisabled} onClick={handleSubmit} variant="contained">
                        Submit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleDialogClose}>Cancel</Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default SubmitEventDialog;