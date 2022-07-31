import { Network, Transaction, TransactionType, Wallet } from "../../synchronizer";

export const ERROR_MSG_NOT_INITIALIZED = "db are not initalized";

export interface IDatabase {
  connect(): Promise<void>;
  close(): Promise<void>;
  insertTransactions(t: Transaction[]): Promise<Transaction[]>;
  listDeposits(network: Network, wallet: string, contract: string): Promise<Transaction[]>;
  listWithdraws(network: Network, wallet: string, contract: string): Promise<Transaction[]>;
  listWallets(network: Network): Promise<string[]>;
  login(network: Network, wallet: string): Promise<Wallet>;
  listTransactionsByHashes(network: Network, hashes: string[]): Promise<Transaction[]>;
  getLastTransactionByType(network: Network, type: TransactionType): Promise<Transaction>;
}
