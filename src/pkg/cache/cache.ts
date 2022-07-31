import { ICache } from "./type";

export class Cache implements ICache {
  private map: Map<string, any>;

  constructor() {
    this.map = new Map<string, any>();
  }

  public set<T>(key: string, value: T | T[]): void {
    this.map.set(key, value);
  }

  public get<T>(key: string): T {
    return this.map.get(key);
  }

  public has(key: string): boolean {
    return this.map.has(key);
  }
}
