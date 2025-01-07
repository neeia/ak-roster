import { NextApiRequest, NextApiResponse } from "next";
import { sendTokenToMail } from "util/hgApi/yostarAuth";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { mail } = req.query as { mail: string };
  const success = await sendTokenToMail(mail.replaceAll(" ", "+"), "en");
  res.status(success ? 200 : 500);
}
