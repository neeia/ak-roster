import { Backspace, PersonAddAlt1 } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, User } from "firebase/auth";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import { OpJsonObj } from "../../types/operator";
import { getNumSkills } from "../../util/changeOperator";
import useOperators from "../../util/useOperators";
import operatorJson from "../../data/operators.json";
import PopOp from "./PopOp";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import OpSelectionButton from "./OpSelectionButton";

interface Props {
  user: User;
}

const AssistantSelection = ((props: Props) => {
  const { user } = props;
  const [operators, onChange, applyBatch] = useOperators();
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const db = getDatabase();

  const [assistant, _setAssistant] = useState<string>(doctor.assistant ?? "");
  const [open, setOpen] = useState<boolean>(false);
  const setAssistant = useCallback((value: string) => {
    const d = { ...doctor };
    _setAssistant(value);
    d.assistant = value;
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/assistant/`), value);
  }, []);
  const clear = () => {
    const d = { ...doctor };
    _setAssistant("");
    delete d.assistant;
    setDoctor(d);
    remove(ref(db, `users/${user.uid}/info/assistant/`));
  };

  const filter = (op: OpJsonObj) => operators[op.id]?.owned;

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
      <PopOp open={open} onClose={() => setOpen(false)} title="Set Assistant" onClick={setAssistant} filter={filter} />
    </Box>);
});

export default AssistantSelection;