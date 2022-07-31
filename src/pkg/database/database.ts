import { Network, Transaction, TransactionType, Wallet } from "../../synchronizer";
import * as model from "./model";
import { ERROR_MSG_NOT_INITIALIZED, IDatabase } from "./type";
import { DataSource } from "typeorm";

export class Database implements IDatabase {
  private dataSource: DataSource;
  public ready: boolean;

  constructor(url: string) {
    this.ready = false;
    this.dataSource = new DataSource({
      type: "postgres",
      url: url,
      synchronize: true,
      entities: [model.SupplyAaveModel, model.WalletModel],
    });
  }

  public async connect(): Promise<void> {
    await this.dataSource.initialize();
    this.ready = true;
  }

  public async close(): Promise<void> {
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    await this.dataSource.destroy();
  }

  public async insertTransactions(tt: Transaction[]): Promise<Transaction[]> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // parse from Transaction to TransactionModel
    const transactions = tt.map((t) => {
      const transaction = new model.SupplyAaveModel();
      transaction.from(t);
      return transaction;
    });

    // insert bulk in database
    const saved = await this.dataSource.manager.insert(model.SupplyAaveModel, transactions);
    if (transactions.length != saved.identifiers.length) {
      console.warn("the length of the pre and post transactions do not match");
    }

    // parse and add db id from TransactionModel to Transaction
    const parsed = transactions.map((t, index) => {
      const transaction = t.to();
      transaction.id = Number(saved.identifiers[index]);
      return transaction;
    });

    return parsed;
  }

  public async listDeposits(network: Network, wallet: string, contract: string): Promise<Transaction[]> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // find inside database deposit transactions by wallet and contract addres
    const savedTransactions = await this.dataSource.manager.find(model.SupplyAaveModel, {
      where: {
        network,
        wallet,
        contract,
        type: TransactionType.Deposit,
      },
    });

    // parse from TransactionModel to Transaction
    const transactions = savedTransactions.map((t) => t.to());

    return transactions;
  }

  public async listWithdraws(network: Network, wallet: string, contract: string): Promise<Transaction[]> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // find inside database withdraw transactions by wallet and contract address
    const savedTransactions = await this.dataSource.manager.find(model.SupplyAaveModel, {
      where: {
        network,
        wallet,
        contract,
        type: TransactionType.Withdraw,
      },
    });

    // parse from TransactionModel to Transaction
    const transactions = savedTransactions.map((t) => t.to());

    return transactions;
  }

  public async listWallets(network: Network): Promise<string[]> {
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // find inside database all wallets
    // TOOD(ca): implement COUNT using SQL builder
    const wallets = await this.dataSource.manager.find(model.WalletModel, {
      where: {
        network,
      },
    });
    const walletsAddrs = [...new Set(wallets.map((w) => w.address))];

    return walletsAddrs;
  }

  public async login(network: Network, address: string): Promise<Wallet> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // prepare wallet db model
    const wallet = new model.WalletModel();
    wallet.network = network;
    wallet.address = address;

    // insert wallet into the db
    const saved = await this.dataSource.manager.save(model.WalletModel, wallet);
    const parsed = saved.to();

    return parsed;
  }

  public async listTransactionsByHashes(network: Network, hashes: string[]): Promise<Transaction[]> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // get and parse transactions from db
    const transactions = await this.dataSource.manager.find(model.SupplyAaveModel, {
      where: hashes.map((h) => ({ network, hash: h })),
    });
    const parsed = transactions.map((t) => t.to());

    return parsed;
  }

  public async getLastTransactionByType(network: Network, type: TransactionType): Promise<Transaction> {
    // check if class are correctly initialized
    if (!this.ready) {
      throw new Error(ERROR_MSG_NOT_INITIALIZED);
    }

    // get latest transaction from db by transaction type
    const last = await this.dataSource.manager.findOne(model.SupplyAaveModel, {
      where: {
        network,
        type,
      },
      order: {
        createdAt: "DESC",
      },
    });

    // check if exists a transaction response and parse
    if (!last) {
      throw new Error(`could't get the latest transaction with type=${type}`);
    }
    const parse = last.to();

    return parse;
  }
}
