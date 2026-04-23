"use client";
import { useAppStore } from "@/stores/appStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter, usePathname } from "next/navigation";
import { lamportsToSol, shortenAddress } from "@/lib/solana/constants";
import { useVault } from "@/hooks/useVault";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Clock, ShoppingBag, ArrowUpFromLine, ShieldCheck } from "lucide-react";

const navItems = [
  { group: "User", items: [
    { id: "user-vault",         href: "/app/user",              label: "Vault",          icon: LayoutDashboard },
    { id: "user-subscriptions", href: "/app/user/subscriptions",label: "Subscriptions",  icon: Clock },
  ]},
  { group: "Merchant", items: [
    { id: "merchant-overview",  href: "/app/merchant",          label: "Overview",       icon: ShoppingBag },
    { id: "merchant-collect",   href: "/app/merchant/collect",  label: "Collect",        icon: ArrowUpFromLine },
  ]},
  { group: "Protocol", items: [
    { id: "admin",              href: "/app/admin",             label: "Admin",          icon: ShieldCheck },
  ]},
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const { walletBalance } = useVault();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-bg-surface border-r border-border flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 17 17" fill="none" className="w-4 h-4">
                <path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="white" fillOpacity="0.9"/>
                <path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="rgba(60,40,200,0.35)"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Oravara</div>
              <div className="text-[10px] text-text-tertiary tracking-wider uppercase">Solana Payments</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
          {navItems.map(({ group, items }) => (
            <div key={group}>
              <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider px-2 mb-1">{group}</div>
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/app/user" && pathname.startsWith(href));
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all",
                      active
                        ? "bg-accent-dim text-accent font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Wallet */}
        <div className="p-2 border-t border-border">
          {publicKey ? (
            <div className="bg-bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" style={{boxShadow:"0 0 6px #34c97a"}} />
              <span className="font-mono text-xs text-text-secondary flex-1 truncate">{shortenAddress(publicKey.toString())}</span>
              <span className="text-xs font-medium text-text-primary">{lamportsToSol(walletBalance).toFixed(2)}</span>
            </div>
          ) : (
            <WalletMultiButton className="!w-full !bg-accent !rounded-lg !text-sm !font-medium !py-2 !justify-center" />
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
