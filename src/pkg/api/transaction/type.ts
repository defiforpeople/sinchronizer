import { Transaction } from "synchronizer";
import { IDatabase } from "../../database/type";
import { Response } from "../type";

export type Context = {
  db: IDatabase;
};

export type DepositsResponse = Response & {
  data?: {
    deposits: Transaction[];
  };
  meta?: {
    count: number;
  };
};

export type WithdrawsResponse = Response & {
  data?: {
    withdraws: Transaction[];
  };
  meta?: {
    count: number;
  };
};

export type BalacesResponse = Response & {
  data?: {
    deposits: string;
    withdraws: string;
    balance: string;
  };
};
