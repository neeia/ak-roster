import { NextApiRequest, NextApiResponse } from "next";
import { sendTokenToMail } from "util/hgApi/yostarAuth";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { mail, server } = req.query as { mail: string, server: "en" | "kr" | "jp" };
  const success = await sendTokenToMail(mail, server);
  res.status(success ? 200 : 500);
}
