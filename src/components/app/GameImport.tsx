import { UserData } from "types/arknightsApiTypes/apiTypes";
import React, { memo, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
import useSettings from "util/hooks/useSettings";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const EXCLUDED_ITEMS: string[] = [];
const GameImport = memo(() => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [_settings, setSettings] = useSettings();
  if (!_settings.importSettings) {
    setSettings((s) => ({
      ...s,
      importSettings: {
        importProfile: true,
        importDepot: true,
        importOperators: true,
      },
    }));
  }
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

  const sendCode = async (email: string) => {
    enqueueSnackbar("Code sent. Check your e-mail.", { variant: "success" });
    const encodedMail = encodeURIComponent(email);
    fetch(`/api/arknights/sendAuthMail?mail=${encodedMail}`);
  };

  const login = async (email: string, code: string) => {
    enqueueSnackbar("Logging in...");
    const encodedMail = encodeURIComponent(email);
    const result = await fetch(`/api/arknights/getData?mail=${encodedMail}&code=${code}`);
    if (result.ok) {
      const userData = (await result.json()) as UserData;
      await processGameData(userData);
    } else {
      enqueueSnackbar("Error retrieving data.", { variant: "error" });
    }
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
    if (settings.importProfile) {
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
        if (!supportData) continue;
        const instId = supportData.charInstId;
        if (!instId || !roster[instId]) continue;

        let charName = roster[instId].currentTmpl ?? roster[instId].charId;
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
    if (settings.importOperators) {
      const operators: Operator[] = [];
      for (let key in roster) {
        let value = roster[key]!;
        const opData = operatorJson[value.charId];

        //currently amiya only, if not null operator has class change and must be handled in a custom way
        if (value.tmpl)
        {
          for (let key in value.tmpl)
          {
            let altValue = value.tmpl[key];

            //first module is the default one, we can skip.

            let altSupportModules: Record<string, number> = Object.fromEntries(
              opData?.moduleData?.map((mod) => [mod.moduleId, 0]) ?? []
            );
            Object.entries(altValue.equip)
              .slice(1)
              .filter(([moduleKey, moduleValue]) => moduleValue!.locked == 0)
              .forEach(([moduleKey, moduleValue]) => (altSupportModules[moduleKey] = moduleValue!.level));

            let altMasteries = altValue.skills.map((skill) => skill.specializeLevel);
            let skin = altValue.skinId as string | null;
            const opSkins: Skin[] = skinJson[value.charId as keyof typeof skinJson];
            //convert to aceship format
            if (opSkins && skin) {
              const matches = opSkins.filter((x) => x.skinId == skin);
              if (matches.length > 0) {
                skin = matches[0].avatarId;
              }
            }

            let alternativeOperator : Operator = {
              op_id: key,
              elite: value.evolvePhase,
              level: value.level,
              potential: value.potentialRank + 1,
              skill_level: value.mainSkillLvl,
              favorite: _roster[value.charId]?.favorite || false,
              skin: skin,
              modules: altSupportModules,
              masteries: altMasteries,
            }
            operators.push(alternativeOperator);
          }
        }
        else
        {
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

      }
      await supabase.from("operators").upsert(operators);
    }

    //Update depot
    if (settings.importDepot) {
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
      await setDepot(depotData,true);
    }
    enqueueSnackbar("Data imported.", { variant: "success" });
  }

  const [collapse, setCollapse] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      You can import your account data if your account is linked to a Yostar account. Doing this WILL log you out from
      the game, if you are currently logged in.
      <Alert
        component="aside"
        sx={{}}
        variant="outlined"
        severity="info"
        action={
          <IconButton onClick={() => setCollapse(!collapse)}>{collapse ? <ExpandLess /> : <ExpandMore />}</IconButton>
        }
      >
        <AlertTitle>How It Works</AlertTitle>
        <Collapse in={collapse}>
          <Typography sx={{ fontSize: "14px" }}>
            Krooster imitates the login process that the game client goes through when you log in.
          </Typography>
          <Box component="ol" sx={{ marginBlock: 1, paddingInlineStart: 2 }}>
            <Box component="li">
              Your email is sent to our servers, which send a request to the game servers to send you an email with a
              6-digit code.
            </Box>
            <Box component="li">
              Once the code is submitted on this page, another request is sent to our servers, which exchange your email
              and the code with the game servers to receive an access token.
            </Box>
            <Box component="li">
              The server then immediately exchanges this access token with the game server to access the account data.
            </Box>
            <Box component="li">
              Finally, the account data, along with the access token, is returned to the client (the browser) to be
              processed.
              <Box component="ul">
                <Box component="li">
                  If selected, the access token itself is safely stored within the browser's storage. Otherwise, it is
                  discarded.
                </Box>
                <Box component="li">
                  Meanwhile, the rest of the data (as selected below) is processed into the format that the site uses,
                  and uploaded to the database.
                </Box>
              </Box>
            </Box>
          </Box>
          <Typography sx={{ color: "error.main" }}>Notice:</Typography>
          <Typography sx={{ fontSize: "14px", color: "text.primary" }}>
            Krooster is not associated with Yostar or Hypergryph. This is <b>not</b> an officially approved tool. We do
            not take responsibility for any actions taken by Arknights' publishers as a result of signing in using this
            method. Use at your own risk.
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "text.primary" }}>
            So far, no such action has taken place; therefore, we consider it acceptable to offer this tool to our
            general userbase. However, it is your decision to make.
          </Typography>
        </Collapse>
      </Alert>
      <Box>
        Select what you want to import:
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                id="importProfile"
                value={settings?.importProfile ?? true}
                checked={settings?.importProfile ?? true}
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
                value={settings?.importOperators ?? true}
                checked={settings?.importOperators ?? true}
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
                value={settings?.importDepot ?? true}
                checked={settings?.importDepot ?? true}
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
            sendCode(email);
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
          label="Save credentials"
        />
        <Button
          variant="outlined"
          type="submit"
          disabled={code.length !== 6}
          onClick={(event) => {
            event.preventDefault();
            login(email, code);
          }}
        >
          Log In and Sync Data
        </Button>
      </Box>
      <Divider />
      <Button variant="outlined" disabled={!hasToken} onClick={(event) => loginWithToken()}>
        Log In With Previous Credentials
      </Button>
    </Box>
  );
});

GameImport.displayName = "Game Import";
export default GameImport;
