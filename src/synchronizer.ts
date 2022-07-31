import { ITokenManager } from "./pkg/token/type";
import { ICron } from "./pkg/cron/type";

export enum TransactionType {
  Deposit = "deposit",
  Withdraw = "withdraw",
}

export enum TokenType {
  MATIC = "MATIC",
}

export type Network = "eth" | "matic" | "maticmum" | "link";
export type TokenSymbol = "WETH" | "ETH" | "MATIC" | "LINK";

export const NativeTokenSymbol: {
  [key in Network]: TokenSymbol;
} = {
  eth: "ETH",
  matic: "MATIC",
  maticmum: "MATIC",
  link: "LINK",
};

export type Transaction = {
  id?: number;
  network: Network;
  hash: string;
  block: number;
  type: TransactionType;
  wallet: string;
  contract: string;
  amount: string;
  token: TokenType;
  createdAt?: number;
};

export type Wallet = {
  id: string;
  network: Network;
  address: string;
  createdAt: Date;
};

export type Networks = {
  [key in Network]: {
    cron: ICron;
    tm: ITokenManager;
  };
};
