import { UserData } from "types/arknightsApiTypes/apiTypes";
import React, { useState } from "react";
import { Box, Button, Checkbox, Divider, FormControlLabel, Stack, TextField } from "@mui/material";
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
import { enqueueSnackbar } from "notistack";
import useSettings from "../../util/hooks/useSettings";

const EXCLUDED_ITEMS: string[] = [];
const GameImport = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [_settings, setSettings] = useSettings();
  const settings = _settings.importSettings;
  // const [importProfile, setImportProfile] = useState(settings);
  // const [importOperators, setImportOperators] = useState(true);
  // const [importDepot, setImportDepot] = useState(true);
  const [hasToken, setHasToken] = useState(localStorage.getItem("token") != null);
  const [rememberLogin, setRememberLogin] = useState(localStorage.getItem("token") != null);

  const [_roster] = useOperators();

  const [user, setAccount] = useAccount();
  const [, setSupport, removeSupport] = useSupports();
  const [, setDepot] = useDepot();

  const sendCode = async () => {
    enqueueSnackbar("Code sent. Check your e-mail.", { variant: "success" });
    const encodedMail = encodeURIComponent(email);
    fetch(`/api/arknights/sendAuthMail?mail=${encodedMail}`);
  };

  const [triedLogin, setTriedLogin] = useState(false);
  const login = async () => {
    setTriedLogin(true);
    enqueueSnackbar("Logging in...");
    const encodedMail = encodeURIComponent(email);
    const result = await fetch(`/api/arknights/getData?mail=${encodedMail}&code=${code}`);
    if (result.ok) {
      const userData = (await result.json()) as UserData;
      await processGameData(userData);
    } else {
      enqueueSnackbar("Error retrieving data.", { variant: "error" });
    }
    setTriedLogin(false);
  };

  const loginWithToken = async () => {
    enqueueSnackbar("Logging in...", { variant: "info" });
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
      enqueueSnackbar("Error retrieving data.", { variant: "error" });
    }
  };

  async function processGameData(userData: UserData) {
    enqueueSnackbar("Data Retrieved. Processing...", { variant: "info" });

    if (rememberLogin) {
      localStorage.setItem("token", JSON.stringify(userData.tokenData));
      setHasToken(true);
    } else {
      localStorage.removeItem("token");
      setHasToken(false);
    }

    const roster = userData.troop.chars;

    //Update the profile data
    if (settings.importProfile)
    {
      const profileData = userData.status;
      const friendCode = {
        username: profileData.nickName,
        tag: profileData.nickNumber,
      };
      const d = new Date(profileData.registerTs * 1000);
      await setAccount({
        user_id: user!.user_id,
        private: user!.private,
        friendcode: friendCode,
        level: profileData.level,
        assistant: profileData.secretary,
        server: "EN",
        onboard: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      });

      //Update support data
      await removeSupport(0);
      await removeSupport(1);
      await removeSupport(2);
      const supportsData = userData.social.assistCharList;

      for (let i = 0; i < supportsData.length; i++) {
        let supportData = supportsData[i];
        if (!supportData) return;
        const instId = supportData.charInstId;
        if (!instId || !roster[instId]) return;

        let charName = roster[instId].charId;
        let supportModule = supportData.currentEquip;

        let support: OperatorSupport = {
          module: supportModule,
          op_id: charName,
          skill: supportData.skillIndex ?? -1,
          slot: i,
        };
        await setSupport(support);
      }
    }

    //Update roster data
    if (settings.importOperators)
    {
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
    }


    //Update depot
    if (settings.importDepot)
    {
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
    }
    enqueueSnackbar("Data imported.", { variant: "success" });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      You can import your account data if your account is linked to a Yostar account. Doing this WILL log you out from
      the game, if you are currently logged in.
      <Box>
        Select what you want to import:
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                id="importProfile"
                value={settings.importProfile}
                checked={settings.importProfile}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    importSettings: {
                      ...settings,
                      importProfile: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Import Profile"
          />
          <FormControlLabel
            control={
              <Checkbox
                id="importOperators"
                value={settings.importOperators}
                checked={settings.importOperators}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    importSettings: {
                      ...settings,
                      importOperators: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Import Operators"
          />
          <FormControlLabel
            control={
              <Checkbox
                id="importDepot"
                value={settings.importDepot}
                checked={settings.importDepot}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    importSettings: {
                      ...settings,
                      importDepot: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Import Depot"
          />
        </Stack>
      </Box>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
        <Button
          variant="outlined"
          type="submit"
          disabled={email.length === 0}
          onClick={(event) => {
            event.preventDefault();
            sendCode();
          }}
        >
          Send code
        </Button>
      </Box>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
        <Button
          variant="outlined"
          type="submit"
          disabled={code.length !== 6 || triedLogin}
          onClick={(event) => {
            event.preventDefault();
            login();
          }}
        >
          Log in
        </Button>
      </Box>
      <Divider />
      <Button variant="outlined" disabled={!hasToken} onClick={(event) => loginWithToken()}>
        Login with previous credentials
      </Button>
    </Box>
  );
};

export default GameImport;
