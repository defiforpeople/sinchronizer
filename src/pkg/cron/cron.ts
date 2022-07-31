import { IDatabase } from "../database/type";
import { Contract } from "ethers";
import { toTransaction } from "./util";
import { Network, Transaction, TransactionType } from "../../synchronizer";
import { ERROR_MSG_NOT_INITIALIZED, ICron } from "./type";

export class Cron implements ICron {
  private network: Network;
  private intervalMs: number;
  private db: IDatabase;
  private contract: Contract;
  private interval: NodeJS.Timer;
  private latestDepositBlock: number;
  private latestWithdrawBlock: number;
  private ready: boolean;

  constructor(network: Network, intervalMs: number, db: IDatabase, contract: Contract) {
    this.network = network;
    this.intervalMs = intervalMs;
    this.db = db;
    this.contract = contract;
    this.latestDepositBlock = -1;
    this.latestWithdrawBlock = -1;
    this.ready = false;
  }

  private async init(): Promise<void> {
    // get latest deposit transaction from db
    let lastDepositTransaction;
    try {
      lastDepositTransaction = await this.db.getLastTransactionByType(this.network, TransactionType.Deposit);
      this.latestDepositBlock = lastDepositTransaction.block;
    } catch (err: any) {
      console.warn(err.message);
    }

    // get latest withdraw transaction from db
    let lastWithdrawTransaction;
    try {
      lastWithdrawTransaction = await this.db.getLastTransactionByType(this.network, TransactionType.Withdraw);
      this.latestWithdrawBlock = lastWithdrawTransaction.block;
    } catch (err: any) {
      console.warn(err.message);
    }

    this.ready = true;
  }

  private async getNewTransactions(type: TransactionType, latestBlock: number): Promise<Transaction[]> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // prepare and get query to blockchan for getting the events
    const filterFrom =
      type === TransactionType.Deposit ? this.contract.filters.Deposit() : this.contract.filters.Withdraw();
    const fromBlockNumber = latestBlock > 0 ? latestBlock : undefined;
    const events = await this.contract.queryFilter(filterFrom, fromBlockNumber);
    if (!events.length) {
      return [];
    }

    // TODO(ca): research how get datetime using "block_number"

    // sort and find fetched events hashes inside the database
    const sortedTransactions = events.sort((a, b) => a.blockNumber - b.blockNumber);
    const hashes = sortedTransactions.map((e) => e.transactionHash);
    const dbHashes = (await this.db.listTransactionsByHashes(this.network, hashes)).map((t) => t.hash);

    // filter, parse and prepare transactions to bulk insert in database
    const filtered = sortedTransactions.filter((t) => !dbHashes.includes(t.transactionHash));
    if (filtered.length === 0) {
      return [];
    }
    const parsed = filtered.map((e) => toTransaction(this.network, e, type));

    return parsed;
  }

  public async run(): Promise<void> {
    // initialize cronjob instance getting latests deposit/withdraw values
    await this.init();

    this.interval = setInterval(async () => {
      // get and insert new deposits from contract events into the db and then replace block number
      try {
        const deposits = await this.getNewTransactions(TransactionType.Deposit, this.latestDepositBlock);
        if (deposits.length > 0) {
          console.log("inserting deposits in db", deposits);
          await this.db.insertTransactions(deposits);
          this.latestDepositBlock = deposits[deposits.length - 1].block;
        }
      } catch (err: any) {
        console.warn(`could't get or insert deposit transaction, err=${err.message}`);
      }

      // get and insert new withdraws from contracts events into the db and then replace block number
      try {
        const withdraws = await this.getNewTransactions(TransactionType.Withdraw, this.latestWithdrawBlock);
        if (withdraws.length > 0) {
          console.log("inserting withdraw in db", withdraws);
          await this.db.insertTransactions(withdraws);
          this.latestWithdrawBlock = withdraws[withdraws.length - 1].block;
        }
      } catch (err: any) {
        console.warn(`could't get or insert withdraw transaction, err=${err.message}`);
      }
    }, this.intervalMs);
  }

  public stop(): void {
    clearInterval(this.interval);
  }
}
