import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-bg-card border border-border rounded-xl p-5", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, valueClass }: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="text-xs text-text-tertiary uppercase tracking-wider mb-2">{label}</div>
      <div className={cn("text-2xl font-semibold tracking-tight", valueClass ?? "text-text-primary")}>{value}</div>
      {sub && <div className="text-xs text-text-tertiary mt-1">{sub}</div>}
    </div>
  );
}
