import { NextApiRequest, NextApiResponse } from "next";

export interface Account {
  user_id: string;
  account_name: string;
}

export type Get = (
  req: NextApiRequest,
  res: NextApiResponse,
  account: Account
) => void;
