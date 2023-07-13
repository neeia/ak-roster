// communication directly with the yostar & arknights API
// refer to https://github.com/thesadru/arkprts for more information

type ArknightsServer = 'en' | 'jp' | 'kr'
type ArknightsDomain =
    | 'gs'
    | 'as'
    | 'u8'
    | 'hu'
    | 'hv'
    | 'rc'
    | 'an'
    | 'prean'
    | 'sl'
    | 'of'
    | 'pkgAd'
    | 'pkgIOS';
type NetworkConfig = Record<ArknightsDomain, string>;

interface VersionConfig {
    resVersion: string;
    clientVersion: string;
}


let NETWORK_ROUTES: Record<ArknightsServer, string> = {
    en: 'https://ak-conf.arknights.global/config/prod/official/network_config',
    jp: 'https://ak-conf.arknights.jp/config/prod/official/network_config',
    kr: 'https://ak-conf.arknights.kr/config/prod/official/network_config',
};

let YOSTAR_PASSPORT_DOMAINS: Record<ArknightsServer, string> = {
    en: 'https://passport.arknights.global',
    jp: 'https://passport.arknights.jp',
    kr: 'https://passport.arknights.kr',
};

let DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'X-Unity-Version': '2017.4.39f1',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
    'Connection': 'Keep-Alive',
};


// these are normally in a session
// assuming classes are useless for this
let domains: Partial<Record<ArknightsServer, Partial<Record<ArknightsDomain, string>>>> = {};
let versions: Partial<Record<ArknightsServer, Partial<VersionConfig>>> = {};

async function request(
    domain: ArknightsDomain,
    endpoint: string,
    server: ArknightsServer,
    data: any | undefined = undefined,
    headers: Record<string, string> | undefined = undefined
): Promise<any> {
    if (!domains[server]) {
        await loadNetworkConfig(server);
    }

    // sorry I'm not sure how to handle this with typescript
    let url = domains[server]?.[domain as ArknightsDomain];

    if (!url) {
        throw new Error(`Invalid domain ${domain}`);
    }


    if (!url) {
        throw new Error(`Invalid domain ${domain}`);
    }

    if (endpoint) {
        url = `${url}/${endpoint}`;
    }

    let response = await fetch(url, {
        method: data ? 'POST' : 'GET',
        headers: { ...headers, ...DEFAULT_HEADERS },
        body: JSON.stringify(data),
    });
    data = await response.json();
    return data
};

async function loadNetworkConfig(server: ArknightsServer | 'all' | undefined = undefined): Promise<void> {
    server = server || 'all';

    if (server === 'all') {
        await Promise.all(Object.keys(NETWORK_ROUTES).map((s) => loadNetworkConfig(s as ArknightsServer)));
        return;
    }

    console.debug(`Loading network configuration for ${server}`);
    let response = await fetch(NETWORK_ROUTES[server]);
    let data = await response.json();
    let content = JSON.parse(data.content);
    domains[server] = content.configs[content.funcVer].network;
}

async function loadVersionConfig(server: ArknightsServer | 'all' | null = null): Promise<void> {
    server = server || 'all';

    if (server === 'all') {
        await Promise.all(Object.keys(NETWORK_ROUTES).map((s) => loadVersionConfig(s as ArknightsServer)));
        return;
    }

    console.debug(`Loading version configuration for ${server}`);
    let data = await request("hv", "", server);
    versions[server] = JSON.parse(data);
}

// arkprts's YostarAuth + Client

/*
# Usage:

## Ask for code
let client = Client("en")
await client.requestYostarAuth("doctor@gmail.com")

## Get token (for storage)
let client = Client("en")
let [uid, token] = await client.getTokenFromEmailCode("doctor@gmail.com", "123456")

## Get data
let client = Client("en")
client.loginWithToken(uid, token)
let data = await client.getData()
*/
abstract class Client {
    // setup
    server: ArknightsServer;
    deviceId: string

    // final
    uid: string | undefined = undefined;
    secret: string | undefined = undefined;
    seqnum: number | undefined = undefined;


    constructor(server: ArknightsServer) {
        this.server = server
        this.deviceId = crypto.randomUUID();
    }

    async request(domain: ArknightsDomain, endpoint: string, data: any | undefined = undefined, headers: Record<string, string> | undefined = undefined): Promise<any> {
        return await request(domain, endpoint, this.server, data, headers);
    }

    async requestPassport(endpoint: string, body: any | undefined = undefined): Promise<any> {
        let response = await fetch(`${YOSTAR_PASSPORT_DOMAINS[this.server]}/${endpoint}`, { body: JSON.stringify(body) });
        return await response.json();
    }

    // request the game server
    async authenticatedRequest(endpoint: string, data: any | undefined = undefined): Promise<any> {
        if (!this.uid || !this.secret || !this.seqnum) {
            throw new Error("Not authenticated");
        }
        //  this should have a lock
        return await request("gs", endpoint, data, { secret: this.secret, uid: this.uid, seqnum: this.seqnum.toString() });
    }




    async getU8Token(
        channelUid: string,
        accessToken: string
    ): Promise<string> {
        let body = {
            appId: 1,
            platform: 1,
            channelId: 3,
            subChannel: 3,
            extension: JSON.stringify({ uid: channelUid, token: accessToken }),
            worldId: 3,
            deviceId: this.deviceId,
        };

        let data = await this.request("u8", "user/v1/getToken", body);

        this.uid = data.uid;
        let u8Token = data.token;
        return u8Token
    }

    async getSecret(u8Token: string): Promise<void> {
        let serverVersions = versions[this.server]
        if (!serverVersions) {
            await loadVersionConfig(this.server);
        }

        let data = await this.request("gs", "account/login",
            {
                platform: 1,
                networkVersion: 1,
                assetsVersion: serverVersions!["resVersion"],
                clientVersion: serverVersions!["clientVersion"],
                token: u8Token,
                uid: this.uid,
                deviceId: this.deviceId,
                deviceId2: "",
                deviceId3: "",
            },
            {
                secret: "",
                seqnum: "1",
                uid: this.uid!,
            },
        );

        this.secret = data.secret;
    }

    async getAccessToken(channel_uid: string, yostar_token: string): Promise<string> {
        let data = await this.requestPassport("user/login", {
            platform: "android",
            uid: channel_uid,
            token: yostar_token,
            deviceId: this.deviceId,
        });
        return data.accessToken;
    }

    async requestYostarAuth(email: string): Promise<void> {
        await this.requestPassport("account/yostar_auth_request", { platform: "android", account: email, authlang: "en" });
    }

    async submitYostarAuth(email: string, code: string): Promise<[string, string]> {
        let data = await this.requestPassport("account/yostar_auth_submit", { account: email, code: code });
        return [data.yostar_uid, data.yostar_token];
    }

    async getYostarToken(
        email: string,
        yostar_uid: string,
        yostar_token: string
    ): Promise<[string, string]> {
        let data = await this.requestPassport("user/yostar_createlogin", {
            yostar_username: email,
            yostar_uid,
            yostar_token,
            deviceId: this.deviceId,
            createNew: 0,
        });
        return [data.uid, data.token];
    }

    async createGuestAccount(): Promise<[string, string]> {
        let data = await this.requestPassport("user/create", {
            deviceId: this.deviceId
        });
        return [data.uid, data.token];
    }

    async loginWithToken(channel_uid: string, yostar_token: string): Promise<void> {
        let access_token = await this.getAccessToken(channel_uid, yostar_token);
        let u8_token = await this.getU8Token(channel_uid, access_token);
        await this.getSecret(u8_token);
    }

    async getTokenFromEmailCode(
        email: string,
        code: string,
    ): Promise<[string, string]> {
        let [yostar_uid, yostar_token] = await this.submitYostarAuth(email, code);
        return this.getYostarToken(email, yostar_uid, yostar_token);
    }

    async getData(): Promise<any> {
        return await this.authenticatedRequest("account/syncData", { "platform": "1" })
    }
}
