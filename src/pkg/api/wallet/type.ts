import { IDatabase } from "../../database/type";
import { Response } from "../type";

export type Context = {
  db: IDatabase;
};

export type ListWalletsResponse = Response & {
  meta?: {
    count: number;
  };
};

export type LoginWalletResponse = Response & {
  data?: {
    address: string;
    ens: string;
  };
};
