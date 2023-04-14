import { Box } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import React, { useState } from "react";
import { Operator, OperatorData } from "types/operator";
import PopOp from "./PopOp";
import useLocalStorage from "util/useLocalStorage";
import { AccountInfo } from "types/doctor";
import OpSelectionButton from "./OpSelectionButton";
import { selectRoster } from "store/rosterSlice";
import { useAppSelector } from "store/hooks";

interface Props {
  user: User;
}

const Assistant = ((props: Props) => {
  const { user } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});
  const operators = useAppSelector(selectRoster);

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

  const filter = (op: OperatorData) => operators[op.id]?.potential;
  const sort = (a: OperatorData, b: OperatorData) => a.name.localeCompare(b.name);

  // TODO: I don't like the whole PopOp thing. It feels annoying. Can't filter or sort or anything really. What a mess.
  return ( null
    // <Box sx={{ width: "min-content", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
    //   Assistant
    //   <OpSelectionButton
    //     op={operators[assistant]}
    //     onClick={() => {
    //       setOpen(true);
    //     }}
    //     clear={clear}
    //   />
    //   <PopOp
    //     operators={operators}
    //     open={open}
    //     onClose={() => setOpen(false)}
    //     title="Set Assistant"
    //     onClick={setAssistant}
    //     filter={filter}
    //     sort={sort}
    //   />
    // </Box>
    );
});

export default Assistant;