import {NextApiRequest, NextApiResponse} from "next";
import {getGameData, } from "../../../util/hgApi/yostarAuth";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {mail, code} = req.query as {mail: string, code: string};
  const data = await getGameData(mail, code);
  // if (data)
  // {
  //   res.status(500);
  //   return;
  // }
  res.status(200);
  //res.status(success ? 200 : 500);
}