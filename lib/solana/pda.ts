import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { PROGRAM_ID, VAULT_SEED, SUBSCRIPTION_SEED } from "./constants";

export function getVaultPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED), owner.toBuffer()],
    PROGRAM_ID
  );
}

export function getSubscriptionPda(
  owner: PublicKey,
  merchant: PublicKey,
  seedIndex: number
): [PublicKey, number] {
  const idx = Buffer.alloc(8);
  idx.writeBigUInt64LE(BigInt(seedIndex));
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SUBSCRIPTION_SEED),
      owner.toBuffer(),
      merchant.toBuffer(),
      idx,
    ],
    PROGRAM_ID
  );
}
