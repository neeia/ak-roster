import { UserData } from "types/arknightsApiTypes/apiTypes";
import React, { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Operator, Skin } from "types/operators/operator";
import { OperatorSupport } from "types/operators/supports";
import skinJson from "data/skins.json";
import itemJson from "data/items.json";
import useDepot from "util/hooks/useDepot";
import DepotItem from "types/depotItem";
import useSupports from "util/hooks/useSupports";
import useAccount from "util/hooks/useAccount";
import supabase from "supabase/supabaseClient";
import useOperators from "util/hooks/useOperators";
import operatorJson from "data/operators";

const EXCLUDED_ITEMS: string[] = [];
const GameImport = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(localStorage.getItem("token") != null);
  const [rememberLogin, setRememberLogin] = useState(localStorage.getItem("token") != null);

  const [_roster] = useOperators();

  const [user, setAccount] = useAccount();
  const [, setSupport, removeSupport] = useSupports();
  const [, setDepot] = useDepot();

  const sendCode = async () => {
    const result = await fetch(`/api/arknights/sendAuthMail?mail=${email}`);
    if (result.ok) {
      setError("Code sent. Check your e-mail.");
    } else {
      setError("Error sending the code.");
    }
  };

  const login = async () => {
    setError("Logging in...");
    const result = await fetch(`/api/arknights/getData?mail=${email}&code=${code}`);
    if (result.ok) {
      const userData = (await result.json()) as UserData;
      await processGameData(userData);
    } else {
      setError("Error retrieving data.");
    }
  };

  const loginWithToken = async () => {
    setError("Logging in...");
    const tokenData = localStorage.getItem("token");
    const result = await fetch(`/api/arknights/getData`, {
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
    } else {
      localStorage.removeItem("token");
      setHasToken(false);
    }

    //TODO import the other data.
    //Update the profile data
    const profileData = userData.status;
    const friendCode = {
      username: profileData.nickName,
      tag: profileData.nickNumber,
    };
    await setAccount({
      user_id: user!.user_id,
      private: user!.private,
      friendcode: friendCode,
      level: profileData.level,
      assistant: profileData.secretary,
    });

    //Update roster data
    const roster = userData.troop.chars;
    const operators: Operator[] = [];
    for (let key in roster) {
      let value = roster[key]!;
      const opData = operatorJson[value.charId];

      //first module is the default one, we can skip.
      let supportModules: Record<string, number> = Object.fromEntries(
        opData?.moduleData?.map((mod) => [mod.moduleId, 0]) ?? []
      );
      Object.entries(value.equip)
        .slice(1)
        .filter(([moduleKey, moduleValue]) => moduleValue!.locked == 0)
        .forEach(([moduleKey, moduleValue]) => (supportModules[moduleKey] = moduleValue!.level));

      let masteries = value.skills.map((skill) => skill.specializeLevel);
      let skin = value.skin as string | null;
      const opSkins: Skin[] = skinJson[value.charId as keyof typeof skinJson];
      //convert to aceship format
      if (opSkins && skin) {
        const matches = opSkins.filter((x) => x.skinId == skin);
        if (matches.length > 0) {
          skin = matches[0].avatarId;
        }
      }

      let operator: Operator = {
        op_id: value.charId,
        elite: value.evolvePhase,
        level: value.level,
        potential: value.potentialRank + 1,
        skill_level: value.mainSkillLvl,
        favorite: _roster[value.charId]?.favorite || false, // value.starMark == 1,
        skin: skin,
        modules: supportModules,
        masteries: masteries,
      };
      operators.push(operator);
    }
    await supabase.from("operators").upsert(operators);

    //Update support data
    await removeSupport(0);
    await removeSupport(1);
    await removeSupport(2);
    const supportsData = userData.social.assistCharList;

    for (let i = 0; i < supportsData.length; i++) {
      let supportData = supportsData[i];
      let charInstanceId = supportData.charInstId!;
      let charName = roster[charInstanceId]!.charId;
      let supportModule = supportData.currentEquip;

      let support: OperatorSupport = {
        module: supportModule,
        op_id: charName,
        skill: supportData.skillIndex!,
        slot: i,
      };
      await setSupport(support);
    }

    //Update depot
    const depot = userData.inventory;
    const depotData: DepotItem[] = [];
    for (let key in depot) {
      if (!EXCLUDED_ITEMS.includes(key) && key in itemJson) {
        let value = depot[key]!;
        let item: DepotItem = { material_id: key, stock: value };
        depotData.push(item);
      }
    }
    depotData.push({ material_id: "4001", stock: userData.status.gold });
    await setDepot(depotData);

    setError("Data imported.");
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      You can import your account data if your account is linked to a Yostar account. Doing this WILL log you out from
      the game, if you are currently logged in.
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
        control={
          <Checkbox
            id="rememberLogin"
            value={rememberLogin}
            onChange={(event) => setRememberLogin(event.target.checked)}
          />
        }
        label="Remember login"
      />
      <Button variant="outlined" disabled={!hasToken} onClick={(event) => loginWithToken()}>
        Login with previous credentials
      </Button>
      {error}
    </Box>
  );
};

export default GameImport;
