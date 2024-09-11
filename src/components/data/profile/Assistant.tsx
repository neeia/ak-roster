import { Box } from "@mui/material";
import React, { useState } from "react";
import { Operator, OperatorData } from "types/operator";
import PopOp from "./PopOp";
import OpSelectionButton from "./OpSelectionButton";
import {AccountData} from "../../types/auth/accountData";
import {useRosterGetQuery} from "../../store/extendRoster";
import {useAssistantSetMutation} from "../../store/extendAccount";

interface Props {
  user: AccountData;
}

const Assistant = ((props: Props) => {
  const { user } = props;

  const {data: operators, isLoading} = useRosterGetQuery();

  const [assistant, _setAssistant] = useState<string>(user.assistant ?? "");
  const [open, setOpen] = useState<boolean>(false);
  const [setAssistantTrigger] = useAssistantSetMutation();

  const setAssistant = (value: string) => {
    _setAssistant(value);
    setAssistantTrigger(value);
  };
  const clear = () => {
    _setAssistant("");
    setAssistantTrigger(null);
  };

  const filter = (op: OperatorData) => operators![op.id] != null;
  const sort = (a: Operator, b: Operator) => a.op_id.localeCompare(b.op_id);

  // TODO: I don't like the whole PopOp thing. It feels annoying. Can't filter or sort or anything really. What a mess.
  return ( isLoading ? null :
      <Box sx={{width: "min-content", display: "flex", flexDirection: "column", gap: "0.25rem"}}>
        Assistant
        <OpSelectionButton
          op={operators![assistant]}
          onClick={() => {
            setOpen(true);
          }}
          clear={clear}
        />
        <PopOp
          operators={operators!}
          open={open}
          onClose={() => setOpen(false)}
          title="Set Assistant"
          onClick={setAssistant}
          sort={sort}
          filter={filter}
        />
      </Box>
  );
});

export default Assistant;