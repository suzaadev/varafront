"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { getVaultPda } from "@/lib/solana/pda";
import { PublicKey } from "@solana/web3.js";
import idl from "@/lib/solana/idl.json";

const PROGRAM_ID_PK = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
const CONFIG_SEED = Buffer.from("platform_config");
const PLATFORM_WALLET = new PublicKey("6Q1XS5pVa8gEKxrfPXpaAymiZ6pasze8eL47ArXyAopz");

function getConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync([CONFIG_SEED], PROGRAM_ID_PK)[0];
}

export function useMerchant() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const qc = useQueryClient();

  const program = wallet
    ? new Program(idl as Idl, new AnchorProvider(connection, wallet, { commitment: "confirmed" }))
    : null;

  const merchantSubsQuery = useQuery({
    queryKey: ["merchantSubs", wallet?.publicKey?.toString()],
    queryFn: async () => {
      if (!program || !wallet) return [];
      const all = await (program.account as any).subscription.all([
        { memcmp: { offset: 8 + 32, bytes: wallet.publicKey.toBase58() } },
      ]);
      return all.map((a: any) => ({ ...a.account, publicKey: a.publicKey }));
    },
    enabled: !!wallet && !!program,
    refetchInterval: 15000,
  });

  const collectPayment = useMutation({
    mutationFn: async ({ subPda, ownerPubkey }: { subPda: PublicKey; ownerPubkey: PublicKey }) => {
      if (!program || !wallet) throw new Error("Not connected");
      const [vaultPda] = getVaultPda(ownerPubkey);
      await (program.methods as any).collectPayment()
        .accounts({
          subscription: subPda,
          vault: vaultPda,
          merchant: wallet.publicKey,
          config: getConfigPda(),
          platform: PLATFORM_WALLET,
        })
        .rpc();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchantSubs"] }),
  });

  const subs = merchantSubsQuery.data ?? [];
  const now = Date.now() / 1000;
  const dueSubs = subs.filter((s: any) => s.active && s.nextDueAt.toNumber() <= now);
  const failedSubs = subs.filter((s: any) => s.active && s.nextDueAt.toNumber() <= now);

  return {
    merchantSubs: subs,
    dueSubs,
    failedSubs,
    merchantLoading: merchantSubsQuery.isLoading,
    collectPayment,
  };
}
