export interface NetworkConfig
{
  configVer: string,
  funcVer: string,
  configs: {
    V035: {
      override: boolean,
      network: {
        gs: string,
        as: string,
        u8: string,
        hu: string,
        hv: string,
        rc: string,
        an: string,
        prean: string,
        sl: string,
        of: string,
        pkgAd: string,
        pkgIOS: string,
        secure: false,
      }
    }
  }
}

export interface YostarAuthData
{
  result: number,
  yostarUuid: string,
  yostarToken : string,
}

export interface YostarToken
{
  result: number,
  uid: string,
  token : string,
}