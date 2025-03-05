import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import { defaultSettings, LocalStorageSettings } from "types/localStorageSettings";

function useSettings() {
  const [settings, setSettings] = useLocalStorage<LocalStorageSettings>("settings", defaultSettings);

  // set default settings if not present
  useEffect(() => {
    const _settings = { ...settings };
    Object.keys(defaultSettings).forEach((key) => {
      const k = key as keyof typeof _settings;
      if (!_settings[k]) {
        _settings[k] = defaultSettings[k] as any;
      }
    });

    setSettings(_settings);
  }, []);

  return [settings, setSettings] as const;
}

export default useSettings;
