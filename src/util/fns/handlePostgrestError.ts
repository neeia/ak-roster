import { PostgrestError } from "@supabase/supabase-js";
import { enqueueSnackbar } from "notistack";

export default function handlePostgrestError(error: PostgrestError | null) {
  if (error)
    enqueueSnackbar({
      message: `DB${error.code}: ${error.message}`,
      variant: "error",
    });
}
