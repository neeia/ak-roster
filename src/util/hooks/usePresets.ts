import Preset from "types/operators/presets";
import { useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import handlePostgrestError from "util/fns/handlePostgrestError";
import useLocalStorage from "./useLocalStorage";

function usePresets() {
  const [presets, setPresets] = useLocalStorage<Preset[]>("v3_presets", []);
  const [user_id, setUserId] = useState<string>("");

  const addPreset = async (preset: Preset) => {
    const _presets = [...presets];
    _presets.push({ ...preset });
    setPresets(_presets);

    if (!user_id) return;
    const { error } = await supabase
      .from("presets")
      .insert({ ...preset })
      .match({ user_id, index: preset.index });
    handlePostgrestError(error);
  };

  const deletePreset = async (index: number) => {
    let _presets = [...presets];
    delete _presets[index];
    _presets = _presets.filter((p) => p);
    setPresets(_presets.map((p, index) => ({ ...p, index })));

    if (!user_id) return;
    const { error } = await supabase.from("presets").delete().eq("index", index);
    handlePostgrestError(error);

    _presets.forEach(async (preset, index) => {
      const { error } = await supabase
        .from("presets")
        .update({ ...preset, index })
        .match({ user_id, index: preset.index });
      if (error) handlePostgrestError(error);
    });
  };

  const changePreset = async (preset: Preset) => {
    const _presets = [...presets];
    _presets[preset.index] = { ...preset };
    setPresets(_presets);

    if (!user_id) return;
    const { error } = await supabase
      .from("presets")
      .update({ ...preset })
      .match({ user_id, index: preset.index });
    handlePostgrestError(error);
  };

  // fetch data from db
  useEffect(() => {
    let isCanceled = false;

    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;
      else setUserId(user_id);

      const { data: dbPresets, error } = await supabase.from("presets").select().match({ user_id });
      if (error) handlePostgrestError(error);

      if (!dbPresets?.length) {
        setPresets([]);
        return;
      }

      const _presets = dbPresets.sort((a, b) => a.index - b.index) as Preset[];
      if (!_presets.every(({ index }, i) => index === i)) {
        _presets.forEach(async (preset, index) => {
          const { error } = await supabase
            .from("presets")
            .update({ ...preset, index })
            .eq("user_id", user_id)
            .eq("index", preset.index);
          if (error) handlePostgrestError(error);
        });
        setPresets(_presets.map((p, index) => ({ ...p, index })));
        return;
      }

      if (!isCanceled) setPresets(_presets);
    };

    fetchData();

    return () => {
      isCanceled = true;
    };
  }, [setPresets]);

  return { presets, addPreset, deletePreset, changePreset } as const;
}

export default usePresets;
