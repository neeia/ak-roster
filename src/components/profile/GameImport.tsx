import {AccountData} from "../../types/auth/accountData";
import {UserData} from "../../types/arknightsApiTypes/apiTypes";
import React, {useState} from "react";
import {Box, Button, TextField} from "@mui/material";
import {useRosterUpsertMutation} from "../../store/extendRoster";
import {Operator, OperatorId} from "../../types/operator";

interface Props {
  user: AccountData;
}

const GameImport = (() => {
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const [upsertRoster] = useRosterUpsertMutation();
  
  const sendCode = async () => {
    const result = await fetch(`/api/arknights/sendAuthMail?mail=${email}`);
    if (result.ok)
    {
      setError("Code sent. Check your e-mail.")
    }
    else
    {
      setError("Error sending the code.")
    }
  };

  const login = async () => {
    const result = await fetch(
      `/api/arknights/getData?mail=${email}&code=${code}`
    );
    if (result.ok) {
      setError("Data Retrieved. Processing...");
      const userData = (await result.json()) as UserData;

      //Update roster data
      const roster = userData.troop.chars;
      console.log(roster);
      const operators : Operator[] = [];
      for (let key in roster)
      {
        console.log(key)
        let value = roster[key]!;
        console.log(value)
        //first module is the default one, we can skip.
        let modules = Object.entries(value.equip).slice(1).map(([moduleKey, moduleValue]) => moduleValue!.level);
        let masteries = value.skills.map((skill) => skill.specializeLevel);
        let operator : Operator = {
          op_id : value.charId as OperatorId,
          elite: value.evolvePhase,
          level: value.level,
          potential: value.potentialRank,
          skill_level: value.mainSkillLvl,
          favorite: value.starMark == 1,
          skin: value.skin as string | undefined,
          modules: modules,
          masteries: masteries,
        }
        operators.push(operator);
      }
      upsertRoster(operators);

    } else {
      setError("Error retrieving data.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      You can import your account data if your account is linked to a Yostar account.
      Doing this WILL log you out from the game, if you are currently logged in.
      <TextField
        id="Mail"
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: "2px 0px 0px 2px",
          },
        }}
        variant="filled"
        label="Mail"
        value={email}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(event.target.value.trim());
        }}
      />
      <Button variant="outlined" disabled={email.length == 0} onClick={(event) => sendCode()}>
        Send code
      </Button>
      <TextField
        id="Code"
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: "2px 0px 0px 2px",
          },
        }}
        variant="filled"
        label="Code"
        value={code}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setCode(event.target.value.trim());
        }}
      />
      <Button variant="outlined" disabled={code.length == 0} onClick={(event) => login()}>
        Login
      </Button>
      {error}
    </Box>
  );
});

export default GameImport;