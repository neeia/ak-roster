import { useEffect } from "react";
import { Operator, defaultPresetObject } from '../types/operator';
import useLocalStorage from './useLocalStorage';
import { repair } from "./useOperators";

function usePresets() {
  const [presets, setPresets] = useLocalStorage<Record<string, Operator>>("presets", Object.fromEntries(
    [...Array(6)].map(defaultPresetObject)
  ));

  const onChange = (presetID: string, newOperator: Operator) => {
    setPresets(
      (oldOperators: Record<string, Operator>): Record<string, Operator> => {
        const copyOperators = { ...oldOperators };
        copyOperators[presetID] = { ...newOperator };
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

  useEffect(() => {
    repair(presets, setPresets);
  }, [])

  return [presets, onChange, rename] as const
}

export default usePresets;