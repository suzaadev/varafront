"use client";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { RPC_URL, PROGRAM_ID } from "./constants";
import idl from "./idl.json";

export function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

export function getProgram(wallet: AnchorWallet): Program {
  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl as Idl, provider);
}

export function getReadonlyProgram(): Program {
  const connection = getConnection();
  const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: "confirmed",
  });
  return new Program(idl as Idl, provider);
}
