"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { getVaultPda, getSubscriptionPda } from "@/lib/solana/pda";
import { solToLamports } from "@/lib/solana/constants";
import { CreateSubscriptionParams } from "@/types";
import idl from "@/lib/solana/idl.json";

export function useSubscriptions() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const qc = useQueryClient();

  const program = wallet
    ? new Program(idl as Idl, new AnchorProvider(connection, wallet, { commitment: "confirmed" }))
    : null;

  const subsQuery = useQuery({
    queryKey: ["subscriptions", wallet?.publicKey?.toString()],
    queryFn: async () => {
      if (!program || !wallet) return [];
      const all = await (program.account as any).subscription.all([
        { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },
      ]);
      return all.map((a: any) => ({ ...a.account, publicKey: a.publicKey }));
    },
    enabled: !!wallet && !!program,
    refetchInterval: 15000,
  });

  const createSubscription = useMutation({
    mutationFn: async (params: CreateSubscriptionParams) => {
      if (!program || !wallet) throw new Error("Not connected");
      const merchant = new PublicKey(params.merchantAddress);
      const [vaultPda] = getVaultPda(wallet.publicKey);
      const [subPda] = getSubscriptionPda(wallet.publicKey, merchant, params.seedIndex);
      await (program.methods as any).createSubscription({
        amountLamports: new BN(solToLamports(params.amountSol)),
        intervalSeconds: new BN(params.intervalSeconds),
        maxCycles: new BN(params.maxCycles),
        seedIndex: new BN(params.seedIndex),
      })
        .accounts({
          subscription: subPda,
          vault: vaultPda,
          owner: wallet.publicKey,
          merchant,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });

  const cancelSubscription = useMutation({
    mutationFn: async (subPda: PublicKey) => {
      if (!program || !wallet) throw new Error("Not connected");
      await (program.methods as any).cancelSubscription()
        .accounts({ subscription: subPda, owner: wallet.publicKey })
        .rpc();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });

  return { subscriptions: subsQuery.data ?? [], subsLoading: subsQuery.isLoading, createSubscription, cancelSubscription };
}
