import "reflect-metadata";

// import contract dependencies
import { MockSupplyAave, MockSupplyAave__factory } from "../../typechain";

// load env values
import dotenv from "dotenv";
dotenv.config();

// import packages
import { Server } from "../../pkg/api";
import { Database } from "../../pkg/database";
import { Cron } from "../../pkg/cron";
import { EnvParser } from "../../pkg/env-parser";
import { Cache } from "../../pkg/cache";
import { TokenManager } from "../../pkg/token";

import { ethers } from "ethers";
import { Networks, Network } from "synchronizer";

// define logger
import log from "pino";
const logger = log();

// define global instances
let api: Server;
let db: Database;
let cron: Cron;

async function main() {
  try {
    // get env values
    const env = EnvParser();

    // define networks for service
    const networks: Networks = {} as Networks;

    // run database package
    db = new Database(env.DATABASE_URL);
    await db.connect();

    // run api package
    api = new Server(env.PORT, db, networks);
    api.run();

    // initialize provider and contract
    for (const networkName in env.NETWORK) {
      const network = env.NETWORK[networkName as Network];
      if (!network) {
        throw new Error(`invalid network_name=${networkName}`);
      }

      // initialize ethers js
      const provider = new ethers.providers.AlchemyProvider(networkName, network.ALCHEMY_API_KEY);

      // intialize contract
      const contract = new ethers.Contract(
        network.CONTRACT_ADDRESS,
        MockSupplyAave__factory.abi,
        provider
      ) as MockSupplyAave;

      // intialize cache package
      const cache = new Cache();

      // initialize token manager package
      const tokenManager = new TokenManager(provider.connection.url, provider, cache);

      // initialize cron package
      cron = new Cron(networkName as Network, env.INTERVAL_SECONDS, db, contract);
      cron.run();

      // add cron and token manager to networks definition
      networks[networkName as Network] = {
        cron,
        tm: tokenManager,
      };
    }
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

// listen process event listeners
const signCb = async () => {
  try {
    cron.stop();
    api.stop();
    await db.close();
  } catch (err) {
    logger.error(err);
  }
};
process.on("SIGTERM", signCb);
process.on("SIGINT", signCb);

// run synchronizer
main();
