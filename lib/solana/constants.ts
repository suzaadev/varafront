import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID!
);

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

export const VAULT_SEED = "vault";
export const SUBSCRIPTION_SEED = "subscription";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function formatSol(lamports: number, decimals = 4): string {
  return lamportsToSol(lamports).toFixed(decimals);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function intervalLabel(seconds: number): string {
  if (seconds === 86400) return "Daily";
  if (seconds === 604800) return "Weekly";
  if (seconds === 2592000) return "Monthly";
  if (seconds === 7776000) return "Quarterly";
  return `Every ${seconds}s`;
}

export function nextDueLabel(nextDueAt: number): string {
  const now = Date.now() / 1000;
  const diff = nextDueAt - now;
  if (diff <= 0) return "Due now";
  const days = Math.floor(diff / 86400);
  if (days > 0) return `In ${days} day${days > 1 ? "s" : ""}`;
  const hours = Math.floor(diff / 3600);
  if (hours > 0) return `In ${hours} hour${hours > 1 ? "s" : ""}`;
  return "Due soon";
}
