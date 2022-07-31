import { createAlchemyWeb3, AlchemyWeb3, TokenMetadataResponse } from "@alch/alchemy-web3";
import { BigNumber } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { ICache } from "../cache/type";
import { ITokenManager, Token } from "./type";
import { NativeTokenSymbol, Network, TokenSymbol } from "../../synchronizer";
import { SimpleConsoleLogger } from "typeorm";

export class TokenManager implements ITokenManager {
  private client: AlchemyWeb3;
  private cache: ICache;
  private provider: Provider;

  constructor(url: string, provider: Provider, cache: ICache) {
    this.client = createAlchemyWeb3(url);
    this.provider = provider;
    this.cache = cache;
  }

  public async getTokens(wallet: string, contract?: string): Promise<Token[]> {
    try {
      // get native token balance
      const balance = await this.provider.getBalance(wallet);

      // get native token symbol
      const networkInfo = await this.provider.getNetwork();
      const symbol = NativeTokenSymbol[networkInfo.name as Network];

      // define native token
      const token: Token = {
        balance: balance.toString(),
        symbol,
        decimals: 18,
        isNative: true,
      };

      // iterate tokens returned by alchemy
      const tokens: Token[] = [token];

      // get tokens balances using alchemy api
      const contracts = contract ? [contract] : undefined;
      const balances = await this.client.alchemy.getTokenBalances(wallet, contracts);

      // check if token balances is empty
      if (!balances.tokenBalances.length) {
        return tokens;
      }

      for (const { error, tokenBalance, contractAddress } of balances.tokenBalances) {
        if (error) {
          console.warn(`can't get balance for token_addr=${contractAddress} err=${error}`);
        }

        // parse balance to bignumber format
        const balance = BigNumber.from(tokenBalance);

        // get token metadata from the cache, if cache not present fetch to alchemy
        let meta: TokenMetadataResponse;
        if (this.cache.has(contractAddress)) {
          meta = this.cache.get(contractAddress);
        } else {
          meta = await this.client.alchemy.getTokenMetadata(contractAddress);
          this.cache.set(contractAddress, meta);
        }

        // check if decimal are present, if not stop the iteration
        if (!meta.decimals) {
          console.warn(`can't get meta decimals for token_addr=${contractAddress}`);
          continue;
        }

        // prepare symbol
        let symbol: TokenSymbol;
        switch (meta.symbol) {
          case "ETH":
          case "WETH":
          case "MATIC":
          case "LINK":
            symbol = meta.symbol;
            break;

          default:
            throw new Error(`invalid token_symbol=${meta.symbol}`);
        }

        // prepare token
        const token: Token = {
          balance: balance.toString(),
          decimals: meta.decimals,
          symbol: symbol,
          address: contractAddress,
          isNative: false,
        };

        tokens.push(token);
      }

      return tokens;
    } catch (err) {
      throw err;
    }
  }
}
