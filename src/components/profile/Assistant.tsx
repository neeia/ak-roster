import { Box } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import { Operator, OpJsonObj } from "../../types/operator";
import useOperators from "../../util/useOperators";
import PopOp from "./PopOp";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import OpSelectionButton from "./OpSelectionButton";

interface Props {
  user: User;
}

const Assistant = ((props: Props) => {
  const { user } = props;
  const [operators] = useOperators();
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const db = getDatabase();

  const [assistant, _setAssistant] = useState<string>(doctor.assistant ?? "");
  const [open, setOpen] = useState<boolean>(false);
  const setAssistant = (value: string) => {
    const d = { ...doctor };
    _setAssistant(value);
    d.assistant = value;
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/assistant/`), value);
  };
  const clear = () => {
    const d = { ...doctor };
    _setAssistant("");
    delete d.assistant;
    setDoctor(d);
    remove(ref(db, `users/${user.uid}/info/assistant/`));
  };

  const filter = (op: OpJsonObj) => operators[op.id]?.owned;
  const sort = (a: Operator, b: Operator) => a.name.localeCompare(b.name);

  return (
    <Box sx={{ width: "min-content", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      Assistant
      <OpSelectionButton
        op={operators[assistant]}
        onClick={() => {
          setOpen(true);
        }}
        clear={clear}
      />
      <PopOp
        operators={operators}
        open={open}
        onClose={() => setOpen(false)}
        title="Set Assistant"
        onClick={setAssistant}
        filter={filter}
        sort={sort}
      />
    </Box>);
});

export default Assistant;