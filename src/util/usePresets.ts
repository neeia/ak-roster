import { Preset, defaultPresetObject } from "../types/operator";
import useLocalStorage from "./useLocalStorage";

function usePresets() {
  const [presets, setPresets] = useLocalStorage<Record<string, Preset>>(
    "presets",
    Object.fromEntries([...Array(6)].map(defaultPresetObject))
  );

  const onChange = (preset: Preset) => {
    setPresets(
      (oldOperators: Record<string, Preset>): Record<string, Preset> => {
        const copyOperators = { ...oldOperators };
        copyOperators[preset.id] = { ...preset };
        return copyOperators;
      }
    );
  };

  const rename = (presetID: string, value: string) => {
    setPresets(
      (oldOperators: Record<string, Preset>): Record<string, Preset> => {
        const copyOperators = { ...oldOperators };
        const copyOperatorData = { ...copyOperators[presetID] };
        copyOperatorData.name = value;
        copyOperators[presetID] = copyOperatorData;
        return copyOperators;
      }
    );
  };

  return [presets, onChange, rename] as const;
}

export default usePresets;
