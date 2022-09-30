import { useEffect } from "react";
import { Operator, defaultPresetObject } from '../types/operator';
import useLocalStorage from './useLocalStorage';
import { repair } from "./useOperators";

function usePresets() {
  const [presets, setPresets] = useLocalStorage<Record<string, Operator>>("presets", Object.fromEntries(
    [...Array(6)].map(defaultPresetObject)
  ));

  const onChange = (preset: Operator) => {
    setPresets(
      (oldOperators: Record<string, Operator>): Record<string, Operator> => {
        const copyOperators = { ...oldOperators };
        copyOperators[preset.id] = { ...preset };
        return copyOperators;
      }
    );
  }

  const rename = (presetID: string, value: string) => {
    setPresets((oldOperators: Record<string, Operator>): Record<string, Operator> => {
      const copyOperators = { ...oldOperators };
      const copyOperatorData = { ...copyOperators[presetID] };
      copyOperatorData.name = value;
      copyOperators[presetID] = copyOperatorData;
      return copyOperators;
    });
  }

  return [presets, onChange, rename] as const
}

export default usePresets;