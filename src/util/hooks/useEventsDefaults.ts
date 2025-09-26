import { useState } from 'react';
import useLocalStorage from './useLocalStorage';
import { TrackerDefaults } from 'types/events';

export interface EventsDefaultsHook {
  readonly trackerDefaults: TrackerDefaults;
  readonly loading: boolean;
  readonly error: string | null;
  readonly fetchDefaults: () => Promise<void>;
}

export default function useEventsDefaults(): EventsDefaultsHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trackerDefaults, setDefaults] = useLocalStorage<TrackerDefaults>("trackerDefaults", {});

  const putDefaults = (updateTime: any, webEventsData: any, eventsData: any,) => {

    setDefaults({
      lastUpdated: updateTime,
      webEventsData: webEventsData,
      eventsData: eventsData
    });
  };

  const fetchEventsFromStorage = async (returnData: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://ak-events-tracker.vercel.app/api/events');
      if (!response.ok) throw new Error('Failed to fetch data');
      const {
        webEventsData,
        eventsData,
        eventsUpdated
      } = await response.json();
      putDefaults(eventsUpdated, webEventsData, eventsData);
      if (returnData) return { data: { webEventsData, eventsData } }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  //lazy fetching by fetchDefaults() call from hook.
  //uncomment useEffect to fetch on page load.
  /* useEffect(() => { */
  const fetchData = async () => {
    try {
      //only pull defaults if no-data or data is one+ day old
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      if (trackerDefaults.lastUpdated && new Date(trackerDefaults.lastUpdated) > dayAgo) {
        return;
      }

      /* console.log("Fetching defaults from storage"); */
      await fetchEventsFromStorage();


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  /* fetchData();
}, []
); */

  return { trackerDefaults, loading, error, fetchDefaults: fetchData } as const;
}