import {
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
  yostarDomains,
  YostarServer,
  YostarToken,
} from "../../types/arknightsApiTypes/apiTypes";
import * as crypto from "crypto";
import { randomUUID } from "crypto";

const sendCodeEndpoint = "/yostar/send-code";
const submitCodeEndpoint = "/yostar/get-auth";
const getYostarTokenEndpoint = "/user/login";
const getu8TokenEndpoint = "/user/v1/getToken";

const loginEndpoint = "/account/login";
const getDataEndpoint = "/account/syncData";

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Unity-Version": "2017.4.39f1",
  "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)",
  Connection: "Keep-Alive",
};

function generateYostarplatHeaders(body: string, server: YostarServer = "en") {
  const linkedHashMap = {
    PID: server === "en" ? "US-ARKNIGHTS" : server === "jp" ? "JP-AK" : "KR-ARKNIGHTS",
    Channel: "googleplay",
    Platform: "android",
    Version: "4.10.0",
    GVersionNo: "2000112",
    GBuildNo: "",
    Lang: server === "en" ? "en" : server === "jp" ? "jp" : "ko",
    DeviceID: randomUUID(),
    DeviceModel: "F9",
    UID: "",
    Token: "",
    Time: Math.floor(Date.now() / 1000),
  };

  const jsonString = JSON.stringify(linkedHashMap, null, "");
  const md5Hash = crypto.createHash("md5").update(jsonString + body + "886c085e4a8d30a703367b120dd8353948405ec2").digest("hex");

  const headerAuth = { Head: linkedHashMap, Sign: md5Hash.toUpperCase() };

  return {
    ...defaultHeaders,
    Authorization: JSON.stringify(headerAuth, null, ""),
  };
}

const sendTokenToMail = async function (mail: string, server: YostarServer): Promise<boolean> {
  const baseurl = yostarDomains[server];
  const body = { Account: mail, Randstr: "", Ticket: "" };
  const headers = generateYostarplatHeaders(JSON.stringify(body), server);

  const sendMail = await fetch(baseurl + sendCodeEndpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers
  });

  return sendMail.ok;
};

/**
 * Gets an account data. Reference source: {@link https://github.com/thesadru/ArkPRTS/blob/master/arkprts/auth.py}
 * @param mail - the yostar account mail linked to the arknights account
 * @param code - the code sent to the mail of the account
 * @param server - the server in which the account is. Valid values are "en", "kr" and "jp"
 * @return {Promise<UserData | null>} - the account {@link UserData} if the request was successful, otherwise null
 */
const getGameData = async function (mail: string, code: string, server: "en" | "kr" | "jp"): Promise<UserData | null> {
  const distributor = "yostar";
  const deviceId1 = randomUUID();
  const deviceId2 = "";
  const deviceId3 = "";

  const networkConfig = await getNetworkConfig(server);
  const yostarToken = await getYostarAuthData(mail, code, server);

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

  return null;
};

const getGameDataWithToken = async function (tokenData: TokenData, server: "en" | "kr" | "jp"): Promise<UserData | null> {
  const distributor = "yostar";
  const deviceId2 = "";
  const deviceId3 = "";

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
  const u8Token = await getU8Token(
    yostarToken.uid,
    yostarToken.token,
    deviceId1,
    deviceId2,
    deviceId3,
    distributor,
    networkConfig
  );

  if (u8Token) {
    const loginSecret = await getLoginSecret(
      u8Token.token,
      u8Token.uid,
      deviceId1,
      deviceId2,
      deviceId3,
      networkConfig
    );

    if (loginSecret) {
      const data = await getData(loginSecret.secret, loginSecret.uid, networkConfig);

      if (data) {
        data.tokenData = {
          token: yostarToken,
          deviceId: deviceId1,
        };
      }
      return data;
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
async function getYostarAuthData(mail: string, code: string, server: YostarServer): Promise<YostarToken | null> {
  const baseurl = yostarDomains[server];
  const body = { Account: mail, Code: code };
  const headers = generateYostarplatHeaders(JSON.stringify(body), server);

  const codeAuthResponse = await fetch(baseurl + submitCodeEndpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers,
  });

  if (codeAuthResponse.ok) {
    const codeAuthResult = await codeAuthResponse.json();
    if (codeAuthResult.Code === 200) {
      const token = codeAuthResult.Data.Token;

      const yostarTokenBody = {
        CheckAccount: 0,
        Geetest: {
          CaptchaID: null,
          CaptchaOutput: null,
          GenTime: null,
          LotNumber: null,
          PassToken: null,
        },
        OpenID: mail,
        Secret: "",
        Token: token,
        Type: "yostar",
        UserName: mail,
      };

      const yostarTokenHeaders = generateYostarplatHeaders(JSON.stringify(yostarTokenBody), server);
      const yostarTokenResponse = await fetch(baseurl + getYostarTokenEndpoint, {
        method: "POST",
        body: JSON.stringify(yostarTokenBody),
        headers: yostarTokenHeaders,
      });

      if (yostarTokenResponse.ok) {
        const yostarTokenResult = await yostarTokenResponse.json();
        if (yostarTokenResult.Code === 200) {
          return {
            uid: yostarTokenResult.Data.UserInfo.ID,
            token: yostarTokenResult.Data.UserInfo.Token,
            result: 0,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Gets the u8 authentication token for an account
 * @param yostarTokenUid - the token uid obtained from {@link getYostarToken}
 * @param accessToken - the access token obtained from {@link getYostarToken}
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

  const extension = {
    type: 1,
    uid: yostarTokenUid,
    token: accessToken,
  };
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
  u8Body.sign = generateU8Sign(u8Body);

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
  return jsonContent["configs"][jsonContent["funcVer"]]["network"] as Record<string, string>;
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
