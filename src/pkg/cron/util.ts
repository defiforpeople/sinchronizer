import { ethers, BigNumber } from "ethers";
import { Network, TokenType, Transaction, TransactionType } from "../../synchronizer";

type TransactionRaw = [userAddr: string, amount: BigNumber];

export const toTransaction = (network: Network, e: ethers.Event, type: TransactionType): Transaction => {
  // check args from event
  if (!e.args?.length) {
    throw new Error("couldn't create the transaction, err=invalid args length");
  }

  // parse transaction from event
  const [userAddr, amount] = e.args as TransactionRaw;

  return {
    network,
    hash: e.transactionHash,
    block: e.blockNumber,
    type,
    wallet: userAddr,
    contract: e.address,
    amount: amount.toString(),
    token: TokenType.MATIC,
  };
};
