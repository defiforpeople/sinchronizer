// load env values
import dotenv from "dotenv";
dotenv.config();

// load dependencies
import { ethers } from "ethers";
import { MockSupplyAave, MockSupplyAave__factory } from "../../typechain";

// check env values
const { NETWORK } = process.env;
if (!NETWORK || NETWORK === "") {
  throw new Error("invalid NETWORK env value");
}
const { ALCHEMY_API_KEY } = process.env;
if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === "") {
  throw new Error("invalid ALCHEMY_API_KEY env value");
}
const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY || PRIVATE_KEY === "") {
  throw new Error("invalid PRIVATE_KEY env value");
}
const { CONTRACT_ADDRESS } = process.env;
if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "") {
  throw new Error("invalid CONTRACT_ADDRESS env value");
}

// define main function
async function main() {
  const provider = new ethers.providers.AlchemyProvider(NETWORK, ALCHEMY_API_KEY);
  const blockNumber = await provider.getBlockNumber();

  console.log("block number", blockNumber);

  const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
  const balance = await wallet.getBalance();

  console.log("balance", ethers.utils.formatEther(balance));

  const contract = new ethers.Contract(CONTRACT_ADDRESS!, MockSupplyAave__factory.abi, provider);
  const connectedContract = contract.connect(wallet) as MockSupplyAave;

  console.log("sending tx...");

  const tx = await connectedContract.withdraw(ethers.utils.parseEther("0.0001"));

  console.log("before waiting tx...");

  await tx.wait();

  console.log("tx", tx);
}

main();
