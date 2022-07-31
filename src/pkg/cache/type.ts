export interface ICache {
  get<T>(key: string): T;
  set<T>(key: string, value: T | T[]): void;
  has<T>(key: string): boolean;
}
