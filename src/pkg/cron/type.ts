export const ERROR_MSG_NOT_INITIALIZED = "cron has not correctly initialized";

export interface ICron {
  run(): Promise<void>;
  stop(): void;
}
