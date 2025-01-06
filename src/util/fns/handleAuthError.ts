import { AuthError } from "@supabase/supabase-js";
import { enqueueSnackbar } from "notistack";

export default function handleAuthError(error: AuthError | null) {
  if (error)
    enqueueSnackbar({
      message: `AUTH${error.code}: ${error.message}`,
      variant: "error",
    });
}
