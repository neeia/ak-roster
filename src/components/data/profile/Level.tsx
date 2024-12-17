import { TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { debounce } from "lodash";
import { AccountMutateProps } from "pages/data/profile";

function parse(n: string, min?: number, max?: number): string {
  if (parseInt(n)) {
    const num = parseInt(n);
    return Math.max(Math.min(num, max ?? num), min ?? num).toString();
  } else {
    return "";
  }
}

const Level = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [level, _setLevel] = useState<string>(user.level?.toString() ?? "");
  const setLevel = (value: string) => {
    _setLevel(value);
    setLevelDebounced(value);
  };

  const setLevelDebounced = useCallback(
    debounce(
      (newLevel) =>
        setAccount({
          user_id: user.user_id,
          level: newLevel,
        }),
      500
    ),
    []
  );

  return (
    <TextField
      id="Level"
      label="Level"
      variant="filled"
      value={level}
      onChange={(e) => {
        setLevel(parse(e.target.value, 1, 120));
      }}
      sx={{
        width: "6rem",
      }}
      slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
    />
  );
};

export default Level;
