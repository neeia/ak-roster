import { useCallback, useMemo } from "react";
import useSettings from './useSettings'
import { EventsData, SubmitEventProps, WebEventsData } from 'types/events'
import { createDefaultEventsData, createEmptyEvent, reindexEvents, getNextMonthsData } from "util/fns/eventUtils"
import useLocalStorage from "./useLocalStorage";

export interface EventsHook {
    readonly eventsData: EventsData;
    readonly setEvents: (newEventsData: EventsData) => void;
    readonly submitEvent: (submit: SubmitEventProps) => null | [string, number][];
    readonly getNextMonthsData: (months?: number) => EventsData;
    readonly createDefaultEventsData: (webEvents: WebEventsData) => EventsData;
    readonly toggleEvent: (name: string) => void;
}
export default function useEvents(): EventsHook {
    const [eventsData, _setEvents] = useLocalStorage<EventsData>("trackerEvents", {});
    const [settings, setSettings] = useSettings();

    const removeOldStorage = useCallback(() => {
        if (settings.depotSettings.eventsIncomeData)
            setSettings(prev => {
                const { eventsIncomeData, ...depotSettings } = prev.depotSettings;
                return { ...prev, depotSettings };
            });
    }, [setSettings, settings.depotSettings.eventsIncomeData]
    );

    const setEvents = useCallback((newEventsData: EventsData) => {
        _setEvents(newEventsData);

        //migrate: If setEvent happened, and old storage exists, remove old storage
        if (Object.keys(newEventsData ?? {}).length > 0)
            removeOldStorage();

    }, [_setEvents, removeOldStorage]);

    //return events based on where storage was
    const _eventsData = useMemo(() => {
        if (Object.keys(eventsData ?? {}).length > 0) {
            return eventsData;
        } else if (settings.depotSettings.eventsIncomeData && Object.keys(settings.depotSettings.eventsIncomeData ?? {}).length > 0) {
            return settings.depotSettings.eventsIncomeData;
        };
        return {};
    }, [eventsData, settings.depotSettings.eventsIncomeData]);

    const getEventByIndex = useCallback((index: number) => {
        if (index === -1) {
            return {
                name: null,
                eventData: { ...createEmptyEvent(), index: 99 },
            };
        }
        const foundEntry = Object.entries(eventsData).find(([, event]) => event.index === index);
        return {
            name: foundEntry ? foundEntry[0] : null,
            eventData: foundEntry ? foundEntry[1] : { ...createEmptyEvent(), index: 99 },
        };
    }, [eventsData]
    );

    const addItemsToEvent = (items: Record<string, number>, addItems: Record<string, number>) => {
        const _items = { ...items };

        Object.entries(addItems).forEach(([key, value]) => {
            if (_items[key]) {
                _items[key] += value;
            } else {
                _items[key] = value;
            }
        });

        return _items;
    };

    const toggleEvent = (name: string) => {
        _setEvents((prev) => {
            const event = prev[name];
            if (!event) return prev;

            return {
                ...prev,
                [name]: {
                    ...event,
                    disabled: !event.disabled
                },
            }
        });
    };

    const submitEvent = useCallback((props: SubmitEventProps): null | [string, number][] => {
        const { targetName, sourceName, targetEventIndex, materialsToDepot, materialsToEvent, action, farms, infinite } = props;
        const _eventsData = { ...eventsData };

        //find target data by index or start new object
        const { name, eventData } = getEventByIndex(targetEventIndex);
        const _event = { ...eventData };
        //event name-key, either use found or submited
        //target event name-key
        /* const _submitName = replaceName ? replaceName : eventName; */
        let _targetName = targetName;
        if (action !== "replace" && name)
            _targetName = name ? name : targetName;

        if (farms.length > 0)
            _event.farms = farms;
        if (infinite.length > 0)
            _event.infinite = infinite;

        switch (action) {
            case "create": {
                if (materialsToEvent)
                    _event.materials = materialsToEvent;
                if (_eventsData[_targetName]) _event.index = _eventsData[_targetName].index;
                _eventsData[_targetName] = _event;
                /* console.log("created event:", { _targetName, data: { ..._eventsData[_targetName] } }) */
            }
                break;
            case "replace": {
                if (materialsToEvent)
                    _event.materials = materialsToEvent;

                _eventsData[_targetName] = _event;
                /* console.log("delete check: ", name, name ? _eventsData[name] : 'noName'); */
                if (name && name !== _targetName && _eventsData[name]) {
                    delete _eventsData[name];
                    /* console.log(" deleting: ", name); */
                }
                /* console.log("replacing:", { _targetName, data: { ..._eventsData[_targetName] } }); */
            }
                break;
            case "modify": {
                if (materialsToEvent)
                    _event.materials = addItemsToEvent(_event.materials, materialsToEvent);

                if (_eventsData[_targetName]) _event.index = _eventsData[_targetName].index;

                _eventsData[_targetName] = _event;
                if (sourceName && sourceName !== _targetName && _eventsData[sourceName]) {
                    delete _eventsData[sourceName];
                    /* console.log(" deleting: ", sourceName); */
                }
                /* console.log("adding to:", { _targetName, data: { ..._eventsData[_targetName] } }); */
            }
                break;
            case "remove": {
                delete _eventsData[_targetName];
                /* console.log("removing", _targetName); */
            }
                break;
        }

        _setEvents(reindexEvents(_eventsData));

        //pipe out materialsToDepot 
        return (materialsToDepot && materialsToDepot.length > 0) ? materialsToDepot : null;

    }, [eventsData, _setEvents, getEventByIndex]);

    const clientCreateDefaultEventsData = (webEvents: WebEventsData): EventsData => {
        return createDefaultEventsData(webEvents) ?? {};
    }
    return {
        eventsData: _eventsData, setEvents, submitEvent, getNextMonthsData,
        createDefaultEventsData: clientCreateDefaultEventsData,
        toggleEvent
    } as const;
}