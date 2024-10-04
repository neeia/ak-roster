import { NextApiRequest, NextApiResponse } from "next";
import fetchAccount from "./fetchAccount";
import { Account, Get } from "types/auth/account";

export default function (GET: Get) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    const account = await fetchAccount(req, res);
    if (!account) return;

    switch (req.method) {
      case "GET":
        GET(req, res, account);
        break;
      default:
        res.status(405);
    }
  };
}
