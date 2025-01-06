import useLocalStorage from "./useLocalStorage";
import { defaultSettings, LocalStorageSettings } from "types/localStorageSettings";

function useSettings() {
  const [settings, setSettings] = useLocalStorage<LocalStorageSettings>("settings", defaultSettings);

  // set default settings if not present
  // useEffect(() => {
  //   const _settings = { ...settings };

  //   setSettings(_settings);
  // }, [settings, setSettings]);

  return [settings, setSettings] as const;
}

export default useSettings;
