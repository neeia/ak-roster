import {NetworkConfig, YostarAuthData, YostarToken} from "../../types/arknightsApiTypes/apiTypes";
import { randomUUID } from 'crypto';

const distributor = "yostar"
const server = "en"
const sendTokenEndpooint = "account/yostar_auth_submit";
const codeAuthUrl = "https://passport.arknights.global";
const sendCodeEndpoint = "/account/yostar_auth_request";
const submitCodeEndpoint = "/account/yostar_auth_submit";
const getYostarTokenEndpoint = "/user/yostar_createlogin";

const networkConfigUrl = "https://ak-conf.arknights.global/config/prod/official/network_config";

const getDataEndpoint = "/account/syncData";
const gs = "https://gs.arknights.global:8443";

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Unity-Version": "2017.4.39f1",
  "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)",
  "Connection": "Keep-Alive",
}

const sendTokenToMail = async function (mail: string) : Promise<boolean> {
  const body = {platform: "android", account: mail, authlang: "en"};
  const sendMail = await fetch(codeAuthUrl + sendCodeEndpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: defaultHeaders,
  });
  console.log("mail sent");
  return (sendMail.ok);
}

// https://github.com/thesadru/ArkPRTS/blob/master/arkprts/auth.py#L590
// _request_yostar_auth  ---> send the mail for the code
// _submit_yostar_auth  ----> first account authentication, gives yostar token and uid
// _get_yostar_token  --> second step, more tokens
// login_with_token   ---> third step, logs in with the tokens


const getGameData = async function (mail: string, code: string): Promise<string | null>
{
  const body = {"account": mail, "code": code};
  const codeAuthResponse = await fetch(codeAuthUrl + submitCodeEndpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: defaultHeaders,
  });
  console.log("getGameData status: " + codeAuthResponse.status);
  if (codeAuthResponse.ok) {
    const codeAuthResult = await codeAuthResponse.json();
    const authData = codeAuthResult as YostarAuthData;
    console.log(authData);

    if (authData.result == 0) {
      const deviceId = randomUUID();
      const yostarTokenBody  = {
        "yostar_username": mail,
        "yostar_uid": authData.yostarUuid,
        "yostar_token": authData.yostarToken,
        "deviceId": deviceId,
        "createNew": "0",
      }

      const yostarTokenResponse = await fetch(codeAuthUrl + getYostarTokenEndpoint, {
        method: "POST",
        body: JSON.stringify(yostarTokenBody),
        headers: defaultHeaders,
      });
      if (yostarTokenResponse.ok)
      {
        const yostarTokenResult = await yostarTokenResponse.json();
        const yostarToken = yostarTokenResult as YostarToken;
        console.log(yostarToken)

        //continue with https://github.com/thesadru/ArkPRTS/blob/9850b59ec454d4d8194614530574ffdfb08775ea/arkprts/auth.py#L616
      }

      // const dataBody = {platform: 1};
      // const dataHeaders = {
      //   "secret": result.yostarToken,
      //   "uid": result.yostarUuid,
      //   "seqnum": "1",
      //   "Content-Type": "application/json",
      //   "X-Unity-Version": "2017.4.39f1",
      //   "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)",
      //   "Connection": "Keep-Alive",
      // }
      //
      // console.log("headers: ");
      // console.log(dataHeaders)
      // const dataResponse = await fetch(gs + getDataEndpoint,
      //   {
      //     method: "POST",
      //     body: JSON.stringify(dataBody),
      //     headers: dataHeaders,
      //   })
      // const dataResult = await dataResponse.json();
      // console.log(dataResult);
      // return dataResult;
    }
  }
  return null;
}

async function getNetworkConfig (): Promise<string> {
  const networkResponse = await fetch(networkConfigUrl, {
    headers: defaultHeaders,
  }).then((res) => res.json());
  const content = networkResponse["content"] as string;
  const jsonContent = JSON.parse(content);
  const networkConfig = jsonContent["configs"][jsonContent["funcVer"]]["network"];
  return networkConfig;
}

export {sendTokenToMail, getGameData};