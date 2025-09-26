import { AK_CALENDAR, AK_DAILY, AK_WEEKLY, EXP } from "util/fns/depot/itemUtils";
import { EventsData, NamedEvent, Event, WebEventsData, WebEvent, UpcomingMaterialsData } from "types/events";
import depotToExp from "./depot/depotToExp";
import DepotItem from "types/depotItem";

export const createEmptyEvent = () => {
    return { index: -1, materials: {} } as Event;
}

export const createEmptyNamedEvent = () => {
    return { ...createEmptyEvent(), name: "", farms: [] } as NamedEvent;
}

const createMonthEvent = (month: number, year: number, startDay: number = 1): NamedEvent | undefined => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayNum = new Date(year, month - 1, 1).getDay();
    const lastDayNum = new Date(year, month - 1, daysInMonth).getDay();

    //to 1-7 = mon-sun
    const firstDay = 1 + (firstDayNum + 6) % 7;
    const lastDay = 1 + (lastDayNum + 6) % 7;

    const materials: Record<string, number> = {};
    const remainingDays = daysInMonth - (startDay !== 1 ? startDay : 0);

    if (!remainingDays) return;

    // AK_CALENDAR - only include days after startDay
    for (const [dayStr, items] of Object.entries(AK_CALENDAR)) {
        const day = parseInt(dayStr);
        if (day > startDay && day <= daysInMonth) {
            for (const [id, amount] of Object.entries(items)) {
                materials[id] = (materials[id] || 0) + amount;
            }
        }
    }

    // AK_DAILY
    for (const [id, amount] of Object.entries(AK_DAILY)) {
        materials[id] = (materials[id] || 0) + amount * remainingDays;
    }

    // AK_WEEKLY - calculate partial weeks based on start day
    let fullWeeks = 0;
    let daysLeft = remainingDays;
    daysLeft -= (8 - firstDay); //remove all days of first week
    daysLeft -= lastDay; //remove last week days
    //add first/last weeks based on wednesday - end of weekly farm normally
    if (firstDay <= 3) fullWeeks++;
    if (lastDay >= 3) fullWeeks++;
    //mid-weeks
    fullWeeks += Math.floor(daysLeft / 7);

    if (fullWeeks) {
        for (const [id, amount] of Object.entries(AK_WEEKLY)) {
            materials[id] = (materials[id] || 0) + amount * fullWeeks;
        }
    }

    const monthEventName = new Date(year, month - 1, daysInMonth)
        .toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    return {
        name: monthEventName,
        index: month,
        materials
    }
};

export const getNextMonthsData = (months: number = 7): EventsData => {
    const nextMonthsData: EventsData = {};
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (let i = 0; i < months; i++) {
        const month = (currentMonth + i) % 12 || 12;
        const year = currentYear + Math.floor((currentMonth + i - 1) / 12);

        const monthEvent = i === 0
            ? createMonthEvent(month, year, currentDay)
            : createMonthEvent(month, year);

        if (!monthEvent) continue;

        nextMonthsData[monthEvent.name] = monthEvent;
    }
    return nextMonthsData;
};

export const reindexEvents = (eventsData: EventsData | [string, Event][]): EventsData => {
    const eventsArray = Array.isArray(eventsData)
        ? eventsData
        : Object.entries(eventsData).sort(([, a], [, b]) => a.index - b.index);

    return eventsArray.reduce((acc, [name, data], idx) => {
        const newData: Event = { ...data, index: idx };

        // Clean farms array
        if (newData.farms) {
            if (newData.farms.length === 0) {
                delete newData.farms;
            } else if (newData.farms.length > 3) {
                newData.farms = newData.farms.slice(0, 3);
            }
        }
        acc[name] = newData;
        return acc;
    }, {} as EventsData);
};

export const createDefaultEventsData = (webEvents: WebEventsData) => {
    if (!webEvents || Object.keys(webEvents).length === 0) return;
    const nextMonthsEvents = getNextMonthsData(7);
    if (!nextMonthsEvents || Object.keys(nextMonthsEvents).length === 0) return;
    /* const result = */
    //const _eventsData: EventsData = {};
    /* const _eventsData: EventsData = Object.fromEntries( */
    const _eventsData = Object.entries(webEvents)
        .filter(([_, wEvent]) =>
            (wEvent.materials && Object.keys(wEvent.materials).length > 0)
            || (wEvent.farms && wEvent.farms.length > 0))
        .map(([name, wEvent]) => {
            let _wEvent = { ...wEvent };
            if (_wEvent.date) {
                const date = new Date(_wEvent.date);
                //decrease web events date by 6 months to sort
                date.setMonth(date.getMonth() + 6);
                _wEvent.date = date;
            }
            return [name, _wEvent] as [string, WebEvent];
        }) //concat with Months events to sort
        .concat(
            Object.entries(nextMonthsEvents).map(([name, event]) => {
                //name is May 2025, convert to last day of month date
                const date = new Date(name);
                const webEvent: WebEvent = {
                    ...event,
                    pageName: name,
                    name,
                    date: date,
                    link: ""
                }
                return [name, webEvent] as [string, WebEvent];
            }))
        .sort(([, a], [, b]) => {
            if (a.date && b.date) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            if (!a.date) return -1;
            if (!b.date) return 1;
            return 0;
        }).reduce((acc, [_, event], idx) => {
            const _name = event.name ?? event.pageName;
            acc[_name] = {
                index: idx,
                materials: event.materials ?? {},
            }
            if (event.farms) {
                acc[_name].farms = event.farms;
            }
            return acc
        }, {} as EventsData)

    return _eventsData;
}

export const getEventsFromWebEvents = (webEvents: WebEventsData): EventsData => {
    return Object.entries(webEvents)
        .filter(([_, wEvent]) =>
            (wEvent.materials && Object.keys(wEvent.materials).length > 0)
            || (wEvent.farms && wEvent.farms.length > 0))
        .sort(([, a], [, b]) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .reduce((acc, [_, item], idx) => {
            const _name = `(${getDateString(item.date ?? new Date())}) ${item.name ?? item.pageName}`;
            acc[_name] = {
                index: idx,
                materials: item.materials ?? {},
            }
            if (item.farms) {
                acc[_name].farms = item.farms;
            }
            return acc
        }, {} as EventsData)
}

export const getDateString = (date: Date | string) => {
    if (!date) return "";
    const _date = new Date(date);
    const day = String(_date.getDate()).padStart(2, '0');
    const month = String(_date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = _date.getFullYear();

    return `${day}-${month}-${year}`;
}

export const getTotalMaterialsUptoSelectedEvent = (
    eventsData: EventsData,
    selectedEvent: NamedEvent
): UpcomingMaterialsData => {
    if (!eventsData || selectedEvent.index === -1) return { materials: {}, farmTimes: {}, infiniteTimes: {} };

    const _eventsData = eventsData;
    const _filteredEvents = Object.entries(_eventsData)
        .filter(([, eventData]) => eventData.index <= selectedEvent.index);
    const _eventMaterials = _filteredEvents
        .reduce((acc, [, eventData]) => {
            if (!eventData.materials) return acc;
            Object.entries(eventData.materials).forEach(([id, quantity]) => {
                acc[id] = (acc[id] ?? 0) + quantity;
            });
            return acc;
        }, {} as Record<string, number>);

    //store xTimes farms appearances and add 0 mats to totals if missing
    const _farmTimes = _filteredEvents
        .reduce((acc, [, eventData]) => {
            if (eventData.farms) {
                eventData.farms.forEach((id) => {
                    acc[id] = (acc[id] ?? 0) + 1;
                    if (!_eventMaterials[id]) {
                        _eventMaterials[id] = 0;
                    }
                })
            };
            return acc;
        }, {} as Record<string, number>);

    const infiniteTimes = _filteredEvents
        .reduce((acc, [, eventData]) => {
            (eventData.infinite ?? []).forEach((id) => {
                acc[id] = (acc[id] ?? 0) + 1;
                if (!_eventMaterials[id]) {
                    _eventMaterials[id] = 0;
                }
            })
            return acc;
        }, {} as Record<string, number>);

    //EXP count
    const _exp = depotToExp(EXP.reduce((acc, id) => {
        acc[id] = { material_id: id, stock: _eventMaterials[id] ?? 0 }
        return acc
    }, {} as Record<string, DepotItem>));

    if (_exp != 0) _eventMaterials["EXP"] = _exp;

    return { materials: _eventMaterials, farmTimes: _farmTimes, infiniteTimes };
}