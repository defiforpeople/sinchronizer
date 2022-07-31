// load dependencies
import http from "http";
import express from "express";
import { IDatabase } from "../database/type";
import { ITokenManager } from "pkg/token/type";

// load routers
import * as wallet from "./wallet";
import * as transaction from "./transaction";
import * as token from "./token";
import { Networks } from "../../synchronizer";

export class Server {
  private port: number;
  private db: IDatabase;
  private server: http.Server;
  private ns: Networks;

  constructor(port: number, db: IDatabase, networks: Networks) {
    this.port = port;
    this.db = db;
    this.ns = networks;
  }

  public run(): void {
    const app = express();

    app.use("/api/v1", transaction.router({ db: this.db }));
    app.use("/api/v1", wallet.router({ db: this.db }));
    app.use("/api/v1", token.router({ ns: this.ns }));

    this.server = app.listen(this.port, async () => {
      console.log(`server are listening on port ${this.port}`);
    });
  }

  public stop(): void {
    this.server.close();
  }
}
