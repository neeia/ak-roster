import { NextApiRequest, NextApiResponse } from "next";
import { getGameData, getGameDataWithToken } from "util/hgApi/yostarAuth";
import { getGameDataSKLandWithToken } from "util/hgApi/sklandAuth";
import { TokenData } from "types/arknightsApiTypes/apiTypes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mail, code, server } = req.query as {
    mail?: string;
    code?: string;
    server: "en" | "kr" | "jp" | "cn";
  };
  try {
    let data;

    if (server === "cn") {
      const token = req.body as TokenData;
      if (!token || !token.token?.token) {
        return res.status(400).json({ error: "Missing tokens string for CN server" });
      }
      data = await getGameDataSKLandWithToken(token);
    } else {
      const token = req.body as TokenData;
      data = token
        ? await getGameDataWithToken(token, server)
        : await getGameData(mail!, code!, server);
    }

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(500).json({ error: "Failed to fetch data" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}