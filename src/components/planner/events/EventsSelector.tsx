import React, { useMemo, useState } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Stack,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import ItemBase from "components/planner/depot/ItemBase";
import { EventsSelectorProps } from "types/events"
import { getItemBaseStyling, customItemsSort, formatNumber, getFarmCSS } from "util/fns/depot/itemUtils";
import { createEmptyEvent, createEmptyNamedEvent } from 'util/fns/eventUtils';

export const EventsSelector = React.memo((props: EventsSelectorProps) => {
    const {
        dataType,
        emptyItem,
        disabled = false,
        eventsData,
        selectedEvent,
        onChange,
    } = props;

    let label: string;
    const emptyOption = emptyItem ? emptyItem : "no selection";

    switch (dataType) {
        case 'summary': {
            label = "Select future event";
            break;
        }
        case 'events': {
            label = emptyItem ? "put materials in" : "Select event";
            break;
        }
        case 'months': { //source only
            label = "Select month";
            break;
        }
        case 'defaults': { //source only
            label = "Select from defaults";
            break;
        }
        case 'defaultsWeb': { //source only
            label = "Select from web data";
            break;
        }
    };

    const [isSelectFinished, setIsSelectFinished] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { itemBaseSize, numberCSS } = getItemBaseStyling('selector', fullScreen);
    const eventsList = useMemo(() => Object.entries(eventsData ?? {})
        .sort(([, a], [, b]) => a.index - b.index), [eventsData]);

    const handleChange = (eventIndex: number) => {
        setIsSelectFinished(true);
        if (eventIndex === -1) {
            onChange?.({ ...createEmptyNamedEvent() });
            return;
        }
        const foundEntry = Object.entries(eventsData).find(([, event]) => event.index === eventIndex);
        onChange?.({
            name: foundEntry ? foundEntry[0] : "",
            ...(foundEntry ? foundEntry[1] : createEmptyEvent()),
        });
        return;
    };

    const handleOnClick = () => {
        setIsSelectFinished(true);
    }

    return (<FormControl sx={{ flexGrow: 1, width: "100%" }}>
        <InputLabel>{label}</InputLabel>
        <Select
            disabled={disabled}
            value={eventsList.length === 0 ? -1 : (selectedEvent?.index ?? -1)}
            onChange={(e) => handleChange(Number(e.target.value))}
            onOpen={() => {
                setIsSelectFinished(false)
            }}
            label={label}
            fullWidth
        >
            <MenuItem value={-1} key={-1} className="no-underline">{emptyOption}</MenuItem>
            <Divider component="li" />
            {eventsList
                .map(([name, event]) => (
                    <MenuItem value={event.index} key={event.index} className="no-underline" onClick={handleOnClick}>
                        <Stack direction="row" justifyContent="flex-end" alignItems="center" width="stretch" flexWrap="wrap">
                            <Typography sx={{ mr: "auto", whiteSpace: "wrap" }}>{`${event.index}: ${name} `}</Typography> {!isSelectFinished ? (
                                <Stack direction="row">
                                    {(event.farms ?? []).map((id) => [id, 0] as [string, number])
                                        .concat(Object.entries(event.materials)
                                            .sort(([itemIdA], [itemIdB]) => customItemsSort(itemIdA, itemIdB)))
                                        .slice(0, fullScreen ? 8 : 10)
                                        .map(([id, quantity], idx) => (
                                            <ItemBase key={`${id}${quantity === 0 && "-farm"} `} itemId={id} size={itemBaseSize}
                                                {...quantity === 0 && getFarmCSS("round")}>
                                                <Typography {...numberCSS}>{quantity === 0 ? ["Ⅰ", "Ⅱ", "Ⅲ"][idx] : formatNumber(quantity)}</Typography>
                                            </ItemBase>
                                        ))}
                                    <small>{"..."}</small>
                                </Stack>) : null}
                        </Stack>
                    </MenuItem>
                ))}
        </Select>
    </FormControl>)

});
EventsSelector.displayName = "EventsSelector";
export default EventsSelector;