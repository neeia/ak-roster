import {AccountData} from "../../types/auth/accountData";
import {TokenData, UserData} from "../../types/arknightsApiTypes/apiTypes";
import React, {useState} from "react";
import {Box, Button, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {useRosterUpsertMutation} from "../../store/extendRoster";
import {Operator, OperatorId, Skin} from "../../types/operator";
import {OperatorSupport} from "../../types/operators/supports";
import {useSupportSetMutation} from "../../store/extendSupports";
import {useAssistantSetMutation, useFriendCodeSetMutation, useLevelSetMutation} from "../../store/extendAccount";
import skinJson from "../../data/skins.json";

interface Props {
  user: AccountData;
}

const GameImport = (() => {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(localStorage.getItem("token") != null)
  const [rememberLogin, setRememberLogin] = useState(localStorage.getItem("token") != null);


  const [upsertRoster] = useRosterUpsertMutation();
  const [setSupport] = useSupportSetMutation();
  const [setFriendCode] = useFriendCodeSetMutation();
  const [setLevelTrigger] = useLevelSetMutation();
  const [setAssistantTrigger] = useAssistantSetMutation();
  
  const sendCode = async () => {
    const result = await fetch(`/api/arknights/sendAuthMail?mail=${email}`);
    if (result.ok)
    {
      setError("Code sent. Check your e-mail.");
    }
    else
    {
      setError("Error sending the code.");
    }
  };

  const login = async () => {
    setError("Logging in...")
    const result = await fetch(
      `/api/arknights/getData?mail=${email}&code=${code}`
    );
    if (result.ok) {
      const userData = (await result.json()) as UserData;
      await processGameData(userData);

    } else {
      setError("Error retrieving data.");
    }
  };

  const loginWithToken = async () => {
    setError("Logging in...")
    const tokenData = localStorage.getItem("token");
    const result = await fetch(
      `/api/arknights/getData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: tokenData,
      });

    if (result.ok) {
      const userData = (await result.json()) as UserData;
      await processGameData(userData);

    } else {
      setError("Error retrieving data.");
    }
  };

  async function processGameData(userData: UserData) {
    setError("Data Retrieved. Processing...");

    if (rememberLogin) {
      localStorage.setItem("token", JSON.stringify(userData.tokenData));
      setHasToken(true);
    }
    else
    {
      localStorage.removeItem("token");
      setHasToken(false);
    }

    //TODO import the other data.
    //Update the profile data
    const profileData = userData.status;
    const friendCode = {username: profileData.nickName, tag: profileData.nickNumber};
    setFriendCode(friendCode);
    setLevelTrigger(profileData.level.toString());

    //Update roster data
    const roster = userData.troop.chars;
    const operators: Operator[] = [];
    for (let key in roster) {
      let value = roster[key]!;
      //first module is the default one, we can skip.
      let supportModules : { [key: string]: number | undefined} = {};
      Object.entries(value.equip).slice(1).filter(([moduleKey, moduleValue]) => moduleValue!.locked == 0).forEach(([moduleKey, moduleValue]) => supportModules[moduleKey] = moduleValue!.level);

      let masteries = value.skills.map((skill) => skill.specializeLevel);
      let skin = value.skin as string | undefined;
      const opSkins: Skin[] = skinJson[value.charId as keyof typeof skinJson];
      //convert to aceship format
      if (skin)
      {
        skin = opSkins.filter(x => x.skinId == skin)[0].avatarId;
        skin = skin.replace('#', "%23")
      }

      let operator: Operator = {
        op_id: value.charId as OperatorId,
        elite: value.evolvePhase,
        level: value.level,
        potential: value.potentialRank,
        skill_level: value.mainSkillLvl,
        favorite: value.starMark == 1,
        skin: skin,
        modules: supportModules,
        masteries: masteries,
      };
      operators.push(operator);
    }
    upsertRoster(operators);

    //Update secretary
    setAssistantTrigger(profileData.secretary);

    //Update support data
    const supportsData = userData.social.assistCharList;

    for (let i = 0; i < supportsData.length; i++)
    {
      let supportData = supportsData[i];
      let charInstanceId = supportData.charInstId!;
      let charName = roster[charInstanceId]!.charId;
      let supportModuleName = supportData.currentEquip;
      let supportModule : { [key: string]: number | undefined} = {};
      if (supportModuleName)
      {
        let supportModuleLevel = roster[charInstanceId]!.equip[supportModuleName]!.level;
        supportModule[supportModuleName] = supportModuleLevel;
      }

      let support :OperatorSupport = {
        module: supportModule,
        op_id: charName,
        skill: supportData.skillIndex!,
        slot: i,
      }
      setSupport(support);
    }

    setError("Data imported.");
  }

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
      <FormControlLabel
        control={<Checkbox
                id="rememberLogin"
                value={rememberLogin}
                onChange={event => setRememberLogin(event.target.checked)}
                />}
        label="Rememeber login"
      />
      <Button variant="outlined" disabled={!hasToken} onClick={(event) => loginWithToken()}>
        Login with previous credentials
      </Button>
      {error}
    </Box>
  );
});

export default GameImport;