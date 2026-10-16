import crypto from "crypto";
import { TokenData, SklandPayload } from "types/arknightsApiTypes/apiTypes";
import transformSklandToYostar from "util/fns/skland/transformSklandToYostar";

const SKLAND_DOMAIN = "https://zonai.skland.com";
const PLAYER_BINDING_URL = "/api/v1/game/player/binding";
const PLAYER_INFO_API = "/api/v1/game/player/info";
const CULTIVATE_PLAYER_API = "/api/v1/game/cultivate/player";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0";

export function getCredAndSecret(text: string): { cred: string; secret: string } {
  if (!text.includes(",")) {
    throw new Error(
      "The cred string format is incorrect; it should be a string containing a comma."
    );
  }
  const cleanedText = text.replace(/\s+/g, "").replace(/["']/g, "");
  const [cred, secret] = cleanedText.split(",");
  return { cred, secret };
}

function getSign(path: string, params: string, secret: string) {
  const timestamp = Math.floor((Date.now() - 300) / 1000).toString();
  const headers = {
    platform: "3",
    timestamp: timestamp,
    dId: DEFAULT_USER_AGENT,
    vName: "1.2.0",
  };

  const text = path + (params || "") + timestamp + JSON.stringify(headers);

  // HMAC SHA-256
  const hmacHex = crypto
    .createHmac("sha256", secret)
    .update(text, "utf8")
    .digest("hex");

  // MD5
  const sign = crypto
    .createHash("md5")
    .update(hmacHex, "utf8")
    .digest("hex");

  return { timestamp, sign };
}

function getHeaders(urlPath: string, params: string, cred: string, secret: string) {
  const { timestamp, sign } = getSign(urlPath, params, secret);

  return {
    platform: "3",
    timestamp: timestamp,
    dId: DEFAULT_USER_AGENT,
    vName: "1.2.0",
    cred: cred,
    sign: sign,
  };
}

export async function getSKLandBindings(cred: string, secret: string) {
  const headers = getHeaders(PLAYER_BINDING_URL, "", cred, secret);
  const res = await fetch(`${SKLAND_DOMAIN}${PLAYER_BINDING_URL}`, {
    method: "GET",
    headers,
  });
  return await res.json();
}

export async function getSKLandPlayerInfo(uid: string, cred: string, secret: string) {
  const params = `uid=${uid}`;
  const headers = getHeaders(PLAYER_INFO_API, params, cred, secret);
  const res = await fetch(`${SKLAND_DOMAIN}${PLAYER_INFO_API}?${params}`, {
    method: "GET",
    headers,
  });
  return await res.json();
}

export async function getSKLandWarehouseInfo(uid: string, cred: string, secret: string) {
  const params = `uid=${uid}`;
  const headers = getHeaders(CULTIVATE_PLAYER_API, params, cred, secret);
  const res = await fetch(`${SKLAND_DOMAIN}${CULTIVATE_PLAYER_API}?${params}`, {
    method: "GET",
    headers,
  });
  return await res.json();
}

// Main exposed function
export async function getGameDataSKLandWithToken(tokenData: TokenData) {
  const rawCredString = tokenData.token.token;
  const { cred, secret } = getCredAndSecret(rawCredString);

  let uid = tokenData.token.uid;

  // Resolve UID if missing
  if (!uid) {
    const bindingRaw = await getSKLandBindings(cred, secret);
    if (bindingRaw.code !== 0) {
      const errorMsg = bindingRaw?.message;
      throw new Error(`Default account search failed, probably invalid or expired SKLand token: ${errorMsg}.`);
    }

    const list = bindingRaw?.data?.list || [];
    let akBindingList: any[] = [];
    for (const item of list) {
      if (item.appCode === "arknights") {
        akBindingList = item.bindingList || [];
        break;
      }
    }

    const defaultAccount =
      akBindingList.find((b: any) => b.isOfficial) || akBindingList[0];

    if (!defaultAccount?.uid) {
      throw new Error("Could not find a valid Arknights UID in accounts list.");
    }
    uid = defaultAccount.uid;
  }

  const [playerInfo, warehouseInfo] = await Promise.all([
    getSKLandPlayerInfo(uid, cred, secret),
    getSKLandWarehouseInfo(uid, cred, secret),
  ]);

  if (playerInfo?.code !== 0 || warehouseInfo?.code !== 0) {
    const errorMsg = playerInfo?.message || warehouseInfo?.message;
    throw new Error(`Fetching data for ${uid} failed, probably invalid or expired SKLand token: ${errorMsg}.`);
  }

  const SklandPayload: SklandPayload = {
    playerInfo: playerInfo?.data ?? null,
    warehouseInfo: warehouseInfo?.data ?? null,
    uid,
  };

  tokenData.token.uid = uid;

  return transformSklandToYostar(SklandPayload, tokenData);
}

export function buildSKLandTokenData(rawCredString: string, uid = ""): TokenData {
  return {
    deviceId: "",
    token: {
      result: 0,
      uid: uid,
      token: rawCredString,
    },
  };
}