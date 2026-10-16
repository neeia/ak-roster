import { TokenData, UserData } from "types/arknightsApiTypes/apiTypes";
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
  Link,
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
import useOperators from "util/hooks/useOperators";
import operatorJson from "data/operators";
import { enqueueSnackbar } from "notistack";
import useSettings from "util/hooks/useSettings";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import useGoals from "util/hooks/useGoals";
import changeGoal from "util/changeGoal";
import { getMaxPotentialById } from "util/changeOperator";
import { buildSKLandTokenData } from "util/hgApi/sklandAuth"

const EXCLUDED_ITEMS: string[] = [];
const GameImport = memo(() => {
  const disabled = false;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [isL1Import, setIsL1Import] = useState<{ error: boolean, email: null | string }>({ error: false, email: null });
  const [collapse, setCollapse] = useState(true);

  const [_settings, setSettings] = useSettings();
  const settings = _settings.importSettings;

  //cn import stuff
  const currentServer = (settings?.importServer ?? "en").toLowerCase();
  const isCnServer = currentServer === "cn";
  const sklandCommand = "copy(localStorage.getItem('SK_OAUTH_CRED_KEY')+','+localStorage.getItem('SK_TOKEN_CACHE_KEY'))";

  useEffect(() => {
    const oldToken = localStorage.getItem("token") != null;
    if (oldToken) localStorage.removeItem("token");
  });

  // Clear input fields when switching between CN and Non-CN servers
  useEffect(() => {
    setEmail("");
    setCode("");
  }, [isCnServer]);

  const [hasToken, setHasToken] = useState(localStorage.getItem("token_new") != null);
  const [rememberLogin, setRememberLogin] = useState(localStorage.getItem("token_new") != null);

  const [_roster, , , overwriteOperators] = useOperators();
  const { goals, updateGoals } = useGoals();

  const [user, setAccount] = useAccount();
  const [, setSupport, removeSupport] = useSupports();
  const [, setDepot] = useDepot();

  const sendCode = async (email: string) => {
    enqueueSnackbar("Code sent. Check your e-mail.", { variant: "success" });
    const encodedMail = encodeURIComponent(email);
    fetch(`/api/arknights/sendAuthMail?mail=${encodedMail}&server=${settings.importServer}`);
  };

  const login = async (inputStr: string, code: string) => {
    enqueueSnackbar("Logging in...", { variant: "info" });

    try {
      let userData: UserData;

      if (isCnServer) {
        // 1. Build SKLand TokenData structure from raw credential string
        const sklandTokenData = buildSKLandTokenData(inputStr);

        const response = await fetch(
          `/api/arknights/getData?server=${settings.importServer}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sklandTokenData),
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Error retrieving CN server data.");
        }

        userData = (await response.json()) as UserData;
      } else {
        // Non-CN login via mail & code query params
        const encodedMail = encodeURIComponent(inputStr);
        const response = await fetch(
          `/api/arknights/getData?mail=${encodedMail}&code=${code}&server=${settings.importServer}`
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Error retrieving data.");
        }

        userData = (await response.json()) as UserData;
      }

      await processGameData(userData);
      enqueueSnackbar("Successfully synchronized data!", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Error retrieving data.", { variant: "error" });
    }
  };

  const loginWithToken = async () => {
    enqueueSnackbar("Logging in...", { variant: "info" });
    const rawTokenData = localStorage.getItem("token_new");

    if (!rawTokenData) {
      enqueueSnackbar("No saved credentials found.", { variant: "error" });
      return;
    }

    try {
      const response = await fetch(
        `/api/arknights/getData?server=${settings.importServer}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: rawTokenData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error retrieving data.");
      }

      const userData = (await response.json()) as UserData;
      await processGameData(userData);
      enqueueSnackbar("Successfully synchronized data!", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Error retrieving data.", { variant: "error" });
    }
  };

  async function processGameData(userData: UserData) {
    //sync on lvl1 account case. Show error and point to instructions
    if (userData.status.level === 1) {
      if (!isCnServer) {
        setIsL1Import({ error: true, email: email });
        setConfirm(false);
      }
      enqueueSnackbar("Error: Retrieved Level 1 Account. Read 'How to fix import' instructions", { variant: "error", autoHideDuration: 10000 });
      return;
    } else {
      setIsL1Import({ error: false, email: null });
    }

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
        server: settings.importServer.toUpperCase(),
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

          if (settings.applyPotentials && operator.potential < getMaxPotentialById(operator.op_id)) {
            const letterName = `voucher_full_${operator.op_id.split("_").pop()}`;
            const potName = `p_${operator.op_id}`;
            const kernelPotName = `class_${potName}`;

            const letterNum = userData.inventory[letterName] ?? 0;
            const potNum = (userData.inventory[potName] ?? 0) + (userData.inventory[kernelPotName] ?? 0);
            if (letterNum > 0) {
              operator.potential = getMaxPotentialById(operator.op_id);
            } else if (potNum > 0) {
              operator.potential = Math.min((operator.potential + potNum), getMaxPotentialById(operator.op_id));
            };
          };

          operators.push(operator);
        }
      }

      //if training is in progress, add +1 to trained skill mastery
      //state: 3 - idle, 2 - finished, not applied, 1 in progress, 0 - no trainee
      const trainingRoom = userData.building.rooms.TRAINING;
      const roomData = trainingRoom ? Object.values(trainingRoom)[0] : null;
      const trainee = roomData?.trainee;

      if (trainee && trainee.charInstId !== -1 && trainee.targetSkill !== -1 && trainee.state !== 3) {
        const traineeId = userData.troop.chars[trainee.charInstId]?.charId;
        const operator = operators.find((o) => o.op_id === traineeId);

        if (operator && operator.masteries && operator.masteries.length > trainee.targetSkill) {
          operator.masteries[trainee.targetSkill] += 1;
        }
      }

      overwriteOperators(operators); //delete old and insert new, through delete-incert new function

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
      if (userData.status.gold) {
        depotData.push({ material_id: "4001", stock: userData.status.gold });
      }
      setDepot(depotData, true);
    }
    enqueueSnackbar("Data imported.", { variant: "success" });
  }

  const isNewUser = (user?.level ?? 0) < 5;
  const showEmailAlert = isNewUser || isL1Import.error;

  const renderHowItWorksContent = (isCnServer: boolean) => {
    if (isCnServer) {
      return (
        <>
          <Typography sx={{ fontSize: "14px" }}>
            Data for CN server accounts is fetched using SKLand web authorization credentials:
          </Typography>
          <Box component="ol" sx={{ marginBlock: 1, paddingInlineStart: 2 }}>
            <Box component="li">
              Your SKLand authorization credentials are passed to our server to communicate directly with the official SKLand API.
            </Box>
            <Box component="li">
              These credentials strictly represent your SKLand web session and are only used to fetch account data from skland.
            </Box>
            <Box component="li">
              If selected, web session credentials are stored locally inside your browser storage for future updates; otherwise, they are discarded immediately after syncing.
            </Box>
          </Box>
          <Typography sx={{ color: "warning.main", fontWeight: "bold", mt: 1 }}>
            Credential Lifespan & Invalidation:
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "text.primary" }}>
            * SKLand credentials have short lived lifecycle. You will need to re-extract them when they expire.
            <br />
            * Logging out of SKLand in your browser immediately invalidates active tokens.
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography sx={{ fontSize: "14px" }}>
          Krooster imitates the login process that the game client goes through when you log in.
        </Typography>
        <Box component="ol" sx={{ marginBlock: 1, paddingInlineStart: 2 }}>
          <Box component="li">
            Your email is sent to our servers, which send a request to the game servers to send you an email with a 6-digit code.
          </Box>
          <Box component="li">
            Once the code is submitted on this page, another request is sent to our servers, which exchange your email and the code with the game servers to receive an access token.
          </Box>
          <Box component="li">
            The server then immediately exchanges this access token with the game server to access the account data.
          </Box>
          <Box component="li">
            Finally, the account data, along with the access token, is returned to the client (the browser) to be processed.
            <Box component="ul">
              <Box component="li">
                If selected, the access token itself is safely stored within the browser's storage. Otherwise, it is discarded.
              </Box>
              <Box component="li">
                Meanwhile, the rest of the data (as selected below) is processed into the format that the site uses, and uploaded to the database.
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  };
  const renderEmailAlertContent = (isCnServer: boolean, isL1Import: any) => {
    if (isCnServer) {
      return (
        <Typography variant="body2">
          Open <b>skland.com</b> in browser, log-in to your account. Press F12 (or Right-Click → Inspect) to open Developer Tools, open Console tab, paste this command into the input prompt at the bottom (next to "&gt;" or "&gt;&gt;" symbols):
          <Box
            component="code"
            onClick={() => navigator.clipboard.writeText(sklandCommand)}
            sx={{
              display: "block",
              bgcolor: "action.hover",
              p: 1,
              my: 1,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "12px",
              userSelect: "all",
              cursor: "pointer",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              position: "relative",
              transition: "background-color 0.2s",
              "&:hover": {
                bgcolor: "action.selected",
              },
              "&::after": {
                content: '"(Click to copy)"',
                display: "inline-block",
                ml: 1,
                fontSize: "11px",
                fontStyle: "italic",
                color: "text.secondary",
                fontFamily: "sans-serif",
              },
            }}
          >
            {sklandCommand}
          </Box>
          Press Enter. After command runs credentials string will be copied, paste it into the field below.
          <i> Browser may ask you to type <b>"allow pasting"</b> before pasting into console. Type it, and retry.</i>
        </Typography>
      );
    }

    return !isL1Import?.error ? (
      <>
        <Typography component="span" variant="body2" sx={{ color: "error.main" }}>
          Warning:
        </Typography>
        <Typography component="span" variant="body2">
          {" "}Import will not work with Google, Apple, Facebook or Recovery Email from "Bind Other Accounts" section.
          <br />Correct option is "Bind Email" button inside User Center, the one with code confirmation.
          <br />Logging in from this page with un-bound in game "Email" will create second <u>level 1 Arknights account</u>, lead to error, and wrong binding of used Email.
        </Typography>
      </>
    ) : (
      <Typography component="span" variant="body2">
        <u>What happened:</u> You didn't bind email, so Arknights created new lvl1 account and bound this email into it...
        <br />
        <u>What to Do to fix:</u>
        <br />Option 1: Remove your email from Level 1 account and bind it into main account:
        <ol>
          <li>Go to AK publisher web site: <Link underline="always" href="https://account.yo-star.com/login">Yostar Account Center</Link></li>
          <li>
            Login into level 1 account with{" "}
            <Typography component="span" color="info" variant="body1">
              {isL1Import?.email ? isL1Import.email : "email"}
            </Typography>{" "}
            + code
          </li>
        </ol>
        Option 2 - simply use another email address to "Bind Email" in your main Arknights account in game settings User Center.
      </Typography>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      You can import your account data if your account is linked to a {isCnServer ? "Skland" : "Yostar"} account. {!isCnServer ? "Using Yostar WILL log you out from the game, if you are currently logged in." : ""}

      {disabled && (
        <Alert component="aside" variant="outlined" severity="error">
          <AlertTitle>Import is currently down.</AlertTitle>
          <Typography sx={{ fontSize: "14px" }}>
            Due to the recent changes to login, importing is temporarily disabled. We're working to get it back online as soon as possible. Thank you for your patience.
          </Typography>
        </Alert>
      )}

      {/* Top Explanation Alert */}
      <Alert
        component="aside"
        variant="outlined"
        severity="info"
        action={
          <IconButton onClick={() => setCollapse(!collapse)}>
            {collapse ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      >
        <AlertTitle>{isCnServer ? "How Skland Import Works" : "How It Works"}</AlertTitle>
        <Collapse in={collapse}>
          {renderHowItWorksContent(isCnServer)}

          <Typography sx={{ color: "error.main", mt: 1 }}>Notice:</Typography>
          <Typography sx={{ fontSize: "14px", color: "text.primary" }}>
            Krooster is not associated with Yostar or Hypergryph. This is <b>not</b> an officially approved tool. We do
            not take responsibility for any actions taken by Arknights' publishers as a result of signing in using presented
            methods. Use at your own risk.
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "text.primary" }}>
            So far, no such action has taken place; therefore, we consider it acceptable to offer this tool to our
            general userbase. However, it is your decision to make.
          </Typography>
        </Collapse>
      </Alert>

      {/* Import Options Checkboxes */}
      <Box>
        Select what you want to import:
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                id="importProfile"
                checked={settings?.importProfile ?? true}
                onChange={(e) => {
                  setSettings((s: any) => ({
                    ...s,
                    importSettings: { ...settings, importProfile: e.target.checked },
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
                checked={settings?.importOperators ?? true}
                onChange={(e) => {
                  setSettings((s: any) => ({
                    ...s,
                    importSettings: { ...settings, importOperators: e.target.checked },
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
                checked={settings?.refreshGoals ?? true}
                disabled={!(settings?.importOperators ?? true)}
                onChange={(e) => {
                  setSettings((s: any) => ({
                    ...s,
                    importSettings: { ...settings, refreshGoals: e.target.checked },
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
                id="applyPotentials"
                checked={(settings?.applyPotentials ?? false)}
                disabled={!(settings?.importOperators ?? true)}
                onChange={(e) => {
                  setSettings((s: any) => ({
                    ...s,
                    importSettings: { ...settings, applyPotentials: e.target.checked },
                  }));
                }}
              />
            }
            label="Add unused Op Tokens to Potentials"
            sx={{ ml: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                id="importDepot"
                checked={settings?.importDepot ?? true}
                onChange={(e) => {
                  setSettings((s: any) => ({
                    ...s,
                    importSettings: { ...settings, importDepot: e.target.checked },
                  }));
                }}
              />
            }
            label="Import Depot"
          />
        </Stack>
      </Box>

      {/* Input Form Section */}
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          select
          value={settings?.importServer ?? "en"}
          label="Server"
          onChange={(e) => {
            setSettings((s: any) => ({
              ...s,
              importSettings: {
                ...settings,
                importServer: e.target.value.toLowerCase() as "en" | "jp" | "kr" | "cn",
              },
            }));
          }}
          variant="outlined"
          size="small"
        >
          <MenuItem value={"en"}>EN</MenuItem>
          <MenuItem value={"jp"}>JP</MenuItem>
          <MenuItem value={"kr"}>KR</MenuItem>
          <MenuItem value={"cn"}>CN - Skland</MenuItem>
        </TextField>

        {/* Warning / Instruction Alert */}
        <Alert
          component="aside"
          variant="outlined"
          severity={isCnServer ? "info" : !isL1Import?.error ? "warning" : "info"}
        >
          <AlertTitle>
            {isCnServer ? (
              <Typography variant="body1">Extract Skland Credentials via DevTools (F12)</Typography>
            ) : !isL1Import?.error ? (
              <Typography variant="body1">"Bind Email" to Arknights account in game settings User Center before Log-In.</Typography>
            ) : (
              <Typography variant="body1">How to Fix Import After Level 1 Account Error:</Typography>
            )}
          </AlertTitle>

          {(showEmailAlert || isCnServer) && (
            <>
              {renderEmailAlertContent(isCnServer, isL1Import)}

              {/* Hide Level 1 Checkbox for CN Server */}
              {!isCnServer && (
                <>
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="confirm"
                        checked={confirm ?? false}
                        onChange={() => setConfirm((v: boolean) => !v)}
                      />
                    }
                    label={
                      !isL1Import?.error ? (
                        <Typography variant="body1">I read lvl1 warning and used “Bind Email” in-game</Typography>
                      ) : (
                        <Typography variant="body1">I completed all steps, and want to try import again</Typography>
                      )
                    }
                  />
                </>
              )}
            </>
          )}
        </Alert>

        {/* Credential / Email Field */}
        <TextField
          id="Mail"
          sx={{
            "& .MuiFilledInput-root": {
              borderRadius: "2px 0px 0px 2px",
            },
          }}
          variant="filled"
          disabled={!isCnServer && showEmailAlert && !confirm}
          label={isCnServer ? "Skland Credentials String" : "Mail"}
          placeholder={isCnServer ? "Paste credentials from clipboard..." : ""}
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setEmail(event.target.value.trim());
          }}
        />

        {/* Hide Send Code button for CN Server */}
        {!isCnServer && (
          <Button
            variant="outlined"
            type="submit"
            disabled={disabled || email.length === 0 || (showEmailAlert && !confirm)}
            onClick={(event) => {
              event.preventDefault();
              sendCode(email);
            }}
          >
            Send code
          </Button>
        )}
      </Box>

      {/* Code & Login Form Section (Code Input completely hidden on CN) */}
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {!isCnServer && (
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
        )}

        <FormControlLabel
          control={
            <Checkbox
              id="rememberLogin"
              checked={rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)}
            />
          }
          label="Save credentials"
        />

        <Button
          variant="outlined"
          type="submit"
          disabled={
            disabled || (isCnServer ? email.length === 0 : code.length !== 6)
          }
          onClick={(event) => {
            event.preventDefault();
            login(email, code);
          }}
        >
          {isCnServer ? "Sync Data From Skland" : "Log In and Sync Data"}
        </Button>
      </Box>

      <Divider />

      <Button
        variant="outlined"
        disabled={disabled || !hasToken}
        onClick={() => loginWithToken()}
      >
         {isCnServer ? "Sync Data With Previous Credentials" : "Log In With Previous Credentials"}
      </Button>
    </Box>
  );
});

GameImport.displayName = "Game Import";
export default GameImport;
