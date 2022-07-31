import { TokenSymbol } from "../../synchronizer";

export type Token = {
  balance: string;
  symbol: TokenSymbol;
  decimals: number;
  address?: string;
  isNative: boolean;
};

export interface ITokenManager {
  getTokens(wallet: string, contract?: string): Promise<Token[]>;
}
