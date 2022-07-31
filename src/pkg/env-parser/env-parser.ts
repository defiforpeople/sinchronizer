import { Environment, ERROR_MSG_INVALID_ENV, NetworkENV } from "./type";

// load env values
import dotenv from "dotenv";
dotenv.config();

export const EnvParser = (): Environment => {
  const env = {
    NETWORK: {},
  } as Environment;

  const { NODE_ENV } = process.env;
  if (!NODE_ENV || NODE_ENV === "") {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${NODE_ENV}`);
  }
  env.NODE_ENV = NODE_ENV;

  const { PORT } = process.env;
  if (!PORT || PORT === "" || Number(PORT) === NaN) {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${PORT}`);
  }
  env.PORT = Number(PORT);

  const { INTERVAL_SECONDS } = process.env;
  if (!INTERVAL_SECONDS || INTERVAL_SECONDS === "" || Number(PORT) === NaN) {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${INTERVAL_SECONDS}`);
  }
  env.INTERVAL_SECONDS = Number(INTERVAL_SECONDS);

  const { PRIVATE_KEY } = process.env;
  if (!PRIVATE_KEY || PRIVATE_KEY === "") {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${PRIVATE_KEY}`);
  }
  env.PRIVATE_KEY = PRIVATE_KEY;

  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL || DATABASE_URL === "") {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${DATABASE_URL}`);
  }
  env.DATABASE_URL = DATABASE_URL;

  // read networks and iterate over networks and set each env values
  const { NETWORKS } = process.env;
  if (!NETWORKS) {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${NETWORKS}`);
  }
  const names = NETWORKS.split(",");
  for (const networkName of names) {
    const network = getEnvNetwork(networkName);
    env.NETWORK[network.NAME] = network;
  }

  return env;
};

const getEnvNetwork = (networkName: string): NetworkENV => {
  const upper = networkName.toUpperCase();
  const network = {} as NetworkENV;

  switch (networkName) {
    case "maticmum":
    case "matic": {
      network.NAME = networkName;
      network.ALCHEMY_API_KEY = getStrEnv(`${upper}_ALCHEMY_API_KEY`);
      network.CONTRACT_ADDRESS = getStrEnv(`${upper}_CONTRACT_ADDRESS`);
      break;
    }
  }

  return network;
};

const getStrEnv = (env: string): string => {
  const ENV = process.env[env];
  if (!ENV || ENV === "") {
    throw new Error(`${ERROR_MSG_INVALID_ENV}, env=${ENV}`);
  }

  return ENV;
};
