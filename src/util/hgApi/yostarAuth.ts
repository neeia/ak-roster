import {
  AccessToken,
  ApiServer,
  ArknightsServer,
  channelIds,
  Distributor,
  LoginSecret,
  networkConfigUrls,
  PlayerData,
  TokenData,
  U8Token,
  UserData,
  VersionInfo,
  YostarAuthData,
  yostarPassportUrls,
  YostarServer,
  YostarToken,
} from "../../types/arknightsApiTypes/apiTypes";
import { randomUUID } from "crypto";
import * as crypto from "crypto";

const sendCodeEndpoint = "/account/yostar_auth_request";
const submitCodeEndpoint = "/account/yostar_auth_submit";
const getYostarTokenEndpoint = "/user/yostar_createlogin";
const getAccessTokenEndpoint = "/user/login";
const getu8TokenEndpoint = "/user/v1/getToken";

const loginEndpoint = "/account/login";
const getDataEndpoint = "/account/syncData";

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Unity-Version": "2017.4.39f1",
  "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)",
  Connection: "Keep-Alive",
};

const sendTokenToMail = async function (mail: string, server: YostarServer): Promise<boolean> {
  const passportUrl = yostarPassportUrls[server];

  const body = { platform: "android", account: mail, authlang: "en" };
  const sendMail = await fetch(passportUrl + sendCodeEndpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: defaultHeaders,
  });
  // console.log("mail sent");
  return sendMail.ok;
};

/**
 * Gets an account data. Reference source: {@link https://github.com/thesadru/ArkPRTS/blob/master/arkprts/auth.py}
 * @param mail - the yostar account mail linked to the arknights account
 * @param code - the code sent to the mail of the account
 * @return {Promise<UserData | null>} - the account {@link UserData} if the request was successful, otherwise null
 */
const getGameData = async function (mail: string, code: string): Promise<UserData | null> {
  // console.log("starting to get game data");
  const server = "en";
  const distributor = "yostar";

  //deviceId2 and 3 can be empty strings for yostar global
  const deviceId1 = randomUUID();
  const deviceId2 = ""; //getMiddleRandomDeviceId();
  const deviceId3 = ""; //randomUUID();

  const networkConfig = await getNetworkConfig(server);

  // console.log("getting auth data");
  const yostarAuthData = await getYostarAuthData(mail, code, server);
  if (yostarAuthData) {
    // console.log("getting yostar token");
    const yostarToken = await getYostarToken(
      mail,
      yostarAuthData.yostar_uid,
      yostarAuthData.yostar_token,
      deviceId1,
      server
    );
    if (yostarToken) {
      return getGameDataWithTokenInternal(
        yostarToken,
        deviceId1,
        deviceId2,
        deviceId3,
        distributor,
        server,
        networkConfig
      );
    }
  }
  // console.log("something went wrong");
  return null;
};

const getGameDataWithToken = async function (tokenData: TokenData): Promise<UserData | null> {
  // console.log("starting to get game data with starting token");
  const server = "en";
  const distributor = "yostar";

  //deviceId2 and 3 can be empty strings for yostar global
  const deviceId1 = randomUUID();
  const deviceId2 = ""; //getMiddleRandomDeviceId();
  const deviceId3 = ""; //randomUUID();

  const networkConfig = await getNetworkConfig(server);

  return getGameDataWithTokenInternal(
    tokenData.token,
    tokenData.deviceId,
    deviceId2,
    deviceId3,
    distributor,
    server,
    networkConfig
  );
};

/**
 * Gets an account data, with a given Yostar token. Skips the steps for getting a Yostar Token. Reference source: {@link https://github.com/thesadru/ArkPRTS/blob/master/arkprts/auth.py}
 * @param yostarToken - a saved yostar token
 * @param deviceId1 - randomly generated uuid of a device, originally paired with the yostar token
 * @param deviceId2 - randomly generated uuid of a device, originally paired with the yostar token
 * @param deviceId3 - randomly generated uuid of a device, originally paired with the yostar token
 * @param distributor - server distributor
 * @param server - yostar server of the account
 * @param networkConfig - the network config dictionary from {@link getNetworkConfig}
 * @return {Promise<UserData | null>} - the account {@link UserData} if the request was successful, otherwise null
 */
const getGameDataWithTokenInternal = async function (
  yostarToken: YostarToken,
  deviceId1: string,
  deviceId2: string,
  deviceId3: string,
  distributor: Distributor,
  server: YostarServer,
  networkConfig: Record<string, string>
): Promise<UserData | null> {
  // console.log("getting access token");
  const accessToken = await getAccessToken(yostarToken.uid, yostarToken.token, deviceId1, server);
  if (accessToken) {
    // console.log("getting u8 token");
    const u8Token = await getU8Token(
      yostarToken.uid,
      accessToken.accessToken,
      deviceId1,
      deviceId2,
      deviceId3,
      distributor,
      networkConfig
    );
    if (u8Token) {
      // console.log("getting login secret");
      const loginSecret = await getLoginSecret(
        u8Token.token,
        u8Token.uid,
        deviceId1,
        deviceId2,
        deviceId3,
        networkConfig
      );
      if (loginSecret) {
        // console.log("getting user data");
        const data = await getData(loginSecret.secret, loginSecret.uid, networkConfig);
        // console.log("user data got succesfully");
        if (data) {
          data.tokenData = {
            token: yostarToken,
            deviceId: deviceId1,
          };
        }
        return data;
      }
    }
  }
  return null;
};

/**
 * Gets the yostar auth data for an account
 * @param mail - the yostar account mail linked to the arknights account
 * @param code - the code sent to the mail of the account
 * @param server - yostar server of the account
 * @return {Promise<YostarAuthData | null>} - the {@link YostarAuthData}, containing token and uid, if the request was successful, otherwise null
 */
async function getYostarAuthData(mail: string, code: string, server: YostarServer): Promise<YostarAuthData | null> {
  const passportUrl = yostarPassportUrls[server];

  const body = { account: mail, code: code };
  const codeAuthResponse = await fetch(passportUrl + submitCodeEndpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: defaultHeaders,
  });

  if (codeAuthResponse.ok) {
    const codeAuthResult = await codeAuthResponse.json();
    const authData = codeAuthResult as YostarAuthData;
    return authData.result == 0 ? authData : null;
  }

  return null;
}

/**
 * Gets the yostar token for an account
 * @param mail - the yostar account mail linked to the arknights account
 * @param authUid - the auth uid obtained from {@link getYostarToken}
 * @param authToken - the auth token obtained from {@link getYostarToken}
 * @param deviceId1 - randomly generated uuid of a device. **MUST** be the same of {@link getU8Token} and {@link getLoginSecret}
 * @param server - yostar server of the account
 * @return {Promise<YostarToken | null>} - the {@link YostarToken}, containing token and uid, if the request was successful, otherwise null
 */
async function getYostarToken(
  mail: string,
  authUid: string,
  authToken: string,
  deviceId1: string,
  server: YostarServer
): Promise<YostarToken | null> {
  const passportUrl = yostarPassportUrls[server];
  const yostarTokenBody = {
    yostar_username: mail,
    yostar_uid: authUid,
    yostar_token: authToken,
    deviceId: deviceId1,
    createNew: "0",
  };

  const yostarTokenResponse = await fetch(passportUrl + getYostarTokenEndpoint, {
    method: "POST",
    body: JSON.stringify(yostarTokenBody),
    headers: defaultHeaders,
  });

  if (yostarTokenResponse.ok) {
    const yostarTokenResult = await yostarTokenResponse.json();
    const yostarToken = yostarTokenResult as YostarToken;
    return yostarToken.result == 0 ? yostarToken : null;
  }
  return null;
}

/**
 * Gets the passport access token for an account
 * @param yostarTokenUid - the token uid obtained from {@link getYostarToken}
 * @param yostarToken - the yostar token obtained from {@link getYostarToken}
 * @param deviceId1 - randomly generated uuid of a device. **MUST** be the same deviceId1 parameter of other methods
 * @param server - yostar server of the account
 * @return {Promise<AccessToken | null>} - the {@link AccessToken}, containing token and uid, if the request was successful, otherwise null
 */
async function getAccessToken(
  yostarTokenUid: string,
  yostarToken: string,
  deviceId1: string,
  server: YostarServer
): Promise<AccessToken | null> {
  const passportUrl = yostarPassportUrls[server];
  const accessTokenBody = {
    platform: "android",
    uid: yostarTokenUid,
    token: yostarToken,
    deviceId: deviceId1,
  };

  const accessTokenResponse = await fetch(passportUrl + getAccessTokenEndpoint, {
    method: "POST",
    body: JSON.stringify(accessTokenBody),
    headers: defaultHeaders,
  });

  if (accessTokenResponse.ok) {
    const accessTokenResult = await accessTokenResponse.json();
    const accessToken = accessTokenResult as AccessToken;
    return accessToken.result == 0 ? accessToken : null;
  }

  return null;
}

/**
 * Gets the u8 authentication token for an account
 * @param yostarTokenUid - the token uid obtained from {@link getYostarToken}
 * @param accessToken - the access token obtained from {@link getAccessToken}
 * @param deviceId1 - randomly generated uuid of a device. **MUST** be the same deviceId1 parameter of other methods
 * @param deviceId2 - device id generated by {@link getMiddleRandomDeviceId}. **MUST** be the same deviceId2 parameter of other methods
 * @param deviceId3 - randomly generated uuid of a device. **MUST** be the same deviceId3 parameter of other methods
 * @param distributor - server distributor
 * @param networkConfig - the network config dictionary from {@link getNetworkConfig}
 * @return {Promise<U8Token | null>} - the {@link U8Token}, containing token and uid, if the request was successful, otherwise null
 */
async function getU8Token(
  yostarTokenUid: string,
  accessToken: string,
  deviceId1: string,
  deviceId2: string,
  deviceId3: string,
  distributor: Distributor,
  networkConfig: Record<string, string>
): Promise<U8Token | null> {
  const u8Url = networkConfig["u8"];
  const channelId = channelIds[distributor];

  const extension =
    distributor == "yostar"
      ? { uid: yostarTokenUid, token: accessToken }
      : { uid: yostarTokenUid, access_token: accessToken };
  const u8Body: any = {
    appId: "1",
    platform: 1,
    channelId: channelId,
    subChannel: channelId,
    extension: JSON.stringify(extension),
    worldId: channelId,
    deviceId: deviceId1,
    deviceId2: deviceId2,
    deviceId3: deviceId3,
  };
  const u8Sign = generateU8Sign(u8Body);
  u8Body.sign = u8Sign;

  const u8TokenResponse = await fetch(u8Url + getu8TokenEndpoint, {
    method: "POST",
    body: JSON.stringify(u8Body),
    headers: defaultHeaders,
  });
  if (u8TokenResponse.ok) {
    const u8TokenResult = await u8TokenResponse.json();
    const u8Token = u8TokenResult as U8Token;

    return u8Token.result == 0 ? u8Token : null;
  }

  return null;
}

/**
 * Gets the login secret for an account
 * @param u8Token - the u8 token obtained from {@link getU8Token}
 * @param u8Uid - the u8 uid obtained from {@link getU8Token}
 * @param deviceId1 - randomly generated uuid of a device. **MUST** be the same deviceId1 parameter of other methods
 * @param deviceId2 - device id generated by {@link getMiddleRandomDeviceId}. **MUST** be the same deviceId2 parameter of other methods
 * @param deviceId3 - randomly generated uuid of a device. **MUST** be the same deviceId3 parameter of other methods
 * @param networkConfig - the network config dictionary from {@link getNetworkConfig}
 * @return {Promise<LoginSecret | null>} - the {@link LoginSecret}, containing secret and uid, if the request was successful, otherwise null
 */
async function getLoginSecret(
  u8Token: string,
  u8Uid: string,
  deviceId1: string,
  deviceId2: string,
  deviceId3: string,
  networkConfig: Record<string, string>
): Promise<LoginSecret | null> {
  const gsUrl = networkConfig["gs"];
  const versionConfig = await getVersionConfig(networkConfig);
  const getSecretBody = {
    platform: 1,
    networkVersion: "1",
    assetsVersion: versionConfig.resVersion,
    clientVersion: versionConfig.clientVersion,
    token: u8Token,
    uid: u8Uid,
    deviceId: deviceId1,
    deviceId2: deviceId2,
    deviceId3: deviceId3,
  };

  const headers = {
    ...defaultHeaders,
    secret: "",
    seqnum: "1",
    uid: u8Uid,
  };
  const loginResponse = await fetch(gsUrl + loginEndpoint, {
    method: "POST",
    body: JSON.stringify(getSecretBody),
    headers: headers,
  });
  if (loginResponse.ok) {
    const loginResult = await loginResponse.json();
    const loginSecret = loginResult as LoginSecret;
    return loginSecret.result == 0 ? loginSecret : null;
  }

  return null;
}

/**
 * Gets the data for an account.
 * @param loginSecret - the login secret obtained from {@link getLoginSecret}
 * @param loginUid - the login uid obtained from {@link getLoginSecret}
 * @param networkConfig - the network config dictionary from {@link getNetworkConfig}
 * @return {Promise<UserData | null>} - the {@link UserData} if the request was successful, otherwise null
 */
async function getData(
  loginSecret: string,
  loginUid: string,
  networkConfig: Record<string, string>
): Promise<UserData | null> {
  const gsUrl = networkConfig["gs"];
  const dataBody = { platform: 1 };
  const dataHeaders = {
    ...defaultHeaders,
    secret: loginSecret,
    uid: loginUid,
    seqnum: "2",
  };

  const dataResponse = await fetch(gsUrl + getDataEndpoint, {
    method: "POST",
    body: JSON.stringify(dataBody),
    headers: dataHeaders,
  });
  if (dataResponse.ok) {
    const dataResult = await dataResponse.json();
    const data = dataResult as PlayerData;
    return data.result == 0 ? data.user : null;
  }

  return null;
}

/**
 * Get the server URLs for the specified server
 * @param server - the server to get the URL of
 * @return {Promise<any>} - returns the server URLs
 *
 */
async function getNetworkConfig(server: ArknightsServer): Promise<Record<string, string>> {
  const networkConfigUrl = networkConfigUrls[server];

  const networkResponse = await fetch(networkConfigUrl, {
    headers: defaultHeaders,
  }).then((res) => res.json());
  const content = networkResponse["content"] as string;
  const jsonContent = JSON.parse(content);
  const networkConfig = jsonContent["configs"][jsonContent["funcVer"]]["network"] as Record<string, string>;
  return networkConfig;
}

/**
 * Get the version configuration from the server
 * @param networkConfig - the dictionary of the network configuration for the server
 * @return {Promise<VersionInfo>} - returns the VersionInfo from the server
 */
async function getVersionConfig(networkConfig: Record<string, string>): Promise<VersionInfo> {
  const hvUrl = networkConfig["hv"];
  const hvUrlFormatted = hvUrl!.replace("{0}", "Android");
  const versionResponse = await fetch(hvUrlFormatted, {
    headers: defaultHeaders,
  });
  const versionResult = await versionResponse.json();
  return versionResult as VersionInfo;
}

function generateRandomString(length: number): string {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getMiddleRandomDeviceId(): string {
  return "86" + generateRandomString(13);
}

function generateU8Sign(data: any): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce((accumulator: any, key) => {
      accumulator[key] = data[key];

      return accumulator;
    }, {});
  const query = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac("sha1", "91240f70c09a08a6bc72af1a5c8d4670");
  return hmac.update(query).digest("hex").toLowerCase();
}

export { sendTokenToMail, getGameData, getGameDataWithToken };
