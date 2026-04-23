import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface VaultAccount {
  owner: PublicKey;
  bump: number;
  balanceLamports: BN;
  subscriptionCount: number;
  createdAt: BN;
}

export interface SubscriptionAccount {
  owner: PublicKey;
  merchant: PublicKey;
  vault: PublicKey;
  amountLamports: BN;
  intervalSeconds: BN;
  nextDueAt: BN;
  lastCollectedAt: BN;
  cancelledAt: BN;
  createdAt: BN;
  maxCycles: BN;
  cyclesCompleted: BN;
  seedIndex: BN;
  active: boolean;
  bump: number;
}

export interface CreateSubscriptionParams {
  merchantAddress: string;
  amountSol: number;
  intervalSeconds: number;
  maxCycles: number;
  seedIndex: number;
}

export type Network = "devnet" | "mainnet-beta";
