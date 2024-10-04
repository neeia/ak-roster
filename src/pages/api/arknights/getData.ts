import { NextApiRequest, NextApiResponse } from "next";
import {
  getGameData,
  getGameDataWithToken,
} from "../../../util/hgApi/yostarAuth";
import { TokenData } from "../../../types/arknightsApiTypes/apiTypes";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { mail, code } = req.query as { mail: string; code: string };
  const token = req.body as TokenData;
  const data = token
    ? await getGameDataWithToken(token)
    : await getGameData(mail, code);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(500);
  }
}
