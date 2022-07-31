import { Networks } from "../../../synchronizer";
import { Token } from "../../token/type";
import { Response } from "../type";

export type Context = {
  ns: Networks;
};

export type TokensResponse = Response & {
  data?: {
    tokens: Token[];
  };
  meta?: {
    count: number;
  };
};
