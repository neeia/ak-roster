import { UserData } from "types/arknightsApiTypes/apiTypes";
import React, { memo, useEffect, useState } from "react";
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
  MenuItem,
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
import useGoals from "util/hooks/useGoals";
import changeGoal from "util/changeGoal";

const EXCLUDED_ITEMS: string[] = [];
const GameImport = memo(() => {
  const disabled = false;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [_settings, setSettings] = useSettings();
  const settings = _settings.importSettings;
  useEffect(() => {
    const oldToken = localStorage.getItem("token") != null;
    if (oldToken) localStorage.removeItem("token");
  });

  const [hasToken, setHasToken] = useState(localStorage.getItem("token_new") != null);
  const [rememberLogin, setRememberLogin] = useState(localStorage.getItem("token_new") != null);

  const [_roster] = useOperators();
  const { goals, updateGoals } = useGoals();

  const [user, setAccount] = useAccount();
  const [, setSupport, removeSupport] = useSupports();
  const [, setDepot] = useDepot();

  const sendCode = async (email: string) => {
    enqueueSnackbar("Code sent. Check your e-mail.", { variant: "success" });
    const encodedMail = encodeURIComponent(email);
    fetch(`/api/arknights/sendAuthMail?mail=${encodedMail}&server=${settings.importServer}`);
  };

  const login = async (email: string, code: string) => {
    enqueueSnackbar("Logging in...");
    const encodedMail = encodeURIComponent(email);
    const result = await fetch(
      `/api/arknights/getData?mail=${encodedMail}&code=${code}&server=${settings.importServer}`
    );
    if (result.ok) {
      const userData = (await result.json()) as UserData;
      await processGameData(userData);
    } else {
      enqueueSnackbar("Error retrieving data.", { variant: "error" });
    }
  };

  const loginWithToken = async () => {
    enqueueSnackbar("Logging in...", { variant: "info" });
    const tokenData = localStorage.getItem("token_new");
    const result = await fetch(`/api/arknights/getData?server=${settings.importServer}`, {
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
      localStorage.setItem("token_new", JSON.stringify(userData.tokenData));
      setHasToken(true);
    } else {
      localStorage.removeItem("token_new");
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
        server: settings.importServer,
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

        let support: OperatorSupport = {
          op_id: charName,
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
        if (value.tmpl) {
          for (let altKey in value.tmpl) {
            let altValue = value.tmpl[altKey];
            const altOpData = operatorJson[altKey]!;

            //first module is the default one, we can skip.

            let altSupportModules: Record<string, number> = Object.fromEntries(
              altOpData?.moduleData?.map((mod) => [mod.moduleId, 0]) ?? []
            );
            Object.entries(altValue.equip)
              .slice(1)
              .filter(([moduleKey, moduleValue]) => moduleValue!.locked == 0)
              .forEach(([moduleKey, moduleValue]) => (altSupportModules[moduleKey] = moduleValue!.level));

            let altMasteries = altValue.skills.map((skill) => skill.specializeLevel);
            let skin = altValue.skinId as string | null;
            const opSkins: Skin[] = skinJson[altKey as keyof typeof skinJson];
            //convert to aceship format
            if (opSkins && skin) {
              const matches = opSkins.filter((x) => x.skinId == skin);
              if (matches.length > 0) {
                skin = matches[0].avatarId;
              }
            }

            let alternativeOperator: Operator = {
              op_id: altKey,
              elite: value.evolvePhase,
              level: value.level,
              potential: value.potentialRank + 1,
              skill_level: value.mainSkillLvl,
              favorite: _roster[altKey]?.favorite || false,
              skin: skin,
              modules: altSupportModules,
              masteries: altMasteries,
            };
            operators.push(alternativeOperator);
          }
        } else {
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

      if (settings.refreshGoals) {
        const _goals = goals.map((g) => {
          const op = operators.find((o) => o.op_id === g.op_id);
          return op ? changeGoal(g, op) : g;
        });
        await updateGoals(_goals);
      }
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
      await setDepot(depotData, true);
    }
    enqueueSnackbar("Data imported.", { variant: "success" });
  }

  const [collapse, setCollapse] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      You can import your account data if your account is linked to a Yostar account. Doing this WILL log you out from
      the game, if you are currently logged in.
      {disabled ? (
        <Alert component="aside" variant="outlined" severity="error">
          <AlertTitle>Import is currently down.</AlertTitle>
          <Typography sx={{ fontSize: "14px" }}>
            Due to the recent changes to login, importing is temporarily disabled. We're working to get it back online
            as soon as possible. Thank you for your patience.
          </Typography>
        </Alert>
      ) : null}
      <Alert
        component="aside"
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
                id="refreshGoals"
                value={settings?.refreshGoals ?? true}
                checked={settings?.refreshGoals ?? true}
                disabled={!(settings?.importOperators ?? true)}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    importSettings: {
                      ...settings,
                      refreshGoals: e.target.checked,
                    },
                  }));
                }}
              />
            }
            label="Update & Clear Planner Goals"
            sx={{ ml: 1 }}
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
          select
          value={settings?.importServer ?? "en"}
          label="Server"
          onChange={(e) => {
            setSettings((s) => ({
              ...s,
              importSettings: {
                ...settings,
                importServer: e.target.value.toLocaleLowerCase() as "en" | "jp" | "kr",
              },
            }));
          }}
          variant="outlined"
          size="small"
        >
          <MenuItem value={"en"}>EN</MenuItem>
          <MenuItem value={"jp"}>JP</MenuItem>
          <MenuItem value={"kr"}>KR</MenuItem>
        </TextField>
        Bind account to Email in game settings before Log In. Google/Apple/other binds alone aren't supported. Without an Email bind, a second new account will be created.
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
          disabled={disabled || email.length === 0}
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
          disabled={disabled || code.length !== 6}
          onClick={(event) => {
            event.preventDefault();
            login(email, code);
          }}
        >
          Log In and Sync Data
        </Button>
      </Box>
      <Divider />
      <Button variant="outlined" disabled={disabled || !hasToken} onClick={(event) => loginWithToken()}>
        Log In With Previous Credentials
      </Button>
    </Box>
  );
});

GameImport.displayName = "Game Import";
export default GameImport;
