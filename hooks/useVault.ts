"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { getVaultPda } from "@/lib/solana/pda";
import { solToLamports } from "@/lib/solana/constants";
import idl from "@/lib/solana/idl.json";

export function useVault() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const qc = useQueryClient();

  const program = wallet
    ? new Program(idl as Idl, new AnchorProvider(connection, wallet, { commitment: "confirmed" }))
    : null;

  const [vaultPda] = wallet
    ? getVaultPda(wallet.publicKey)
    : [null];

  const vaultQuery = useQuery({
    queryKey: ["vault", wallet?.publicKey?.toString()],
    queryFn: async () => {
      if (!program || !vaultPda) return null;
      try {
        return await (program.account as any).vault.fetch(vaultPda);
      } catch {
        return null;
      }
    },
    enabled: !!wallet && !!program,
    refetchInterval: 10000,
  });

  const walletBalanceQuery = useQuery({
    queryKey: ["walletBalance", wallet?.publicKey?.toString()],
    queryFn: async () => {
      if (!wallet) return 0;
      return connection.getBalance(wallet.publicKey);
    },
    enabled: !!wallet,
    refetchInterval: 10000,
  });

  const initVault = useMutation({
    mutationFn: async () => {
      if (!program || !wallet || !vaultPda) throw new Error("Not connected");
      await (program.methods as any).initializeVault()
        .accounts({ vault: vaultPda, owner: wallet.publicKey, systemProgram: SystemProgram.programId })
        .rpc();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });

  const deposit = useMutation({
    mutationFn: async (sol: number) => {
      if (!program || !wallet || !vaultPda) throw new Error("Not connected");
      await (program.methods as any).deposit(new BN(solToLamports(sol)))
        .accounts({ vault: vaultPda, owner: wallet.publicKey, systemProgram: SystemProgram.programId })
        .rpc();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault"] });
      qc.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });

  const withdraw = useMutation({
    mutationFn: async (sol: number) => {
      if (!program || !wallet || !vaultPda) throw new Error("Not connected");
      await (program.methods as any).withdraw(new BN(solToLamports(sol)))
        .accounts({ vault: vaultPda, owner: wallet.publicKey })
        .rpc();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault"] });
      qc.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });

  return {
    vault: vaultQuery.data,
    vaultPda,
    vaultLoading: vaultQuery.isLoading,
    walletBalance: walletBalanceQuery.data ?? 0,
    initVault,
    deposit,
    withdraw,
  };
}
