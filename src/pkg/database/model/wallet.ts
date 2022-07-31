import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { Network, Wallet } from "../../../synchronizer";

@Entity({
  name: "wallet",
})
export class WalletModel {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  network: Network;

  @Column()
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  public from(t: Wallet): void {
    this.id = t.id;
    this.network = t.network;
    this.address = t.address;
    this.createdAt = t.createdAt;
  }

  public to(): Wallet {
    return {
      id: this.id,
      network: this.network,
      address: this.address,
      createdAt: this.createdAt,
    };
  }
}
