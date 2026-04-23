"use client";
import { create } from "zustand";

type AppView = "user-vault" | "user-subscriptions" | "merchant-overview" | "merchant-collect" | "admin";

interface AppState {
  view: AppView;
  setView: (view: AppView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "user-vault",
  setView: (view) => set({ view }),
}));
