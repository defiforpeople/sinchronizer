import { Network } from "./synchronizer";

export const isNetworkValid = (networkName: string): boolean => {
  switch (networkName) {
    case "eth":
    case "matic":
    case "maticmum":
      let nn: Network = networkName;
      return true;

    default:
      return false;
  }
};
