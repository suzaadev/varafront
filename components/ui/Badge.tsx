import { cn } from "@/lib/utils";

type Variant = "green" | "red" | "amber" | "accent" | "gray";

const variants: Record<Variant, string> = {
  green: "bg-success/10 text-success",
  red: "bg-danger/10 text-danger",
  amber: "bg-warning/10 text-warning",
  accent: "bg-accent-dim text-accent",
  gray: "bg-white/5 text-text-secondary",
};

export function Badge({ variant = "gray", children }: { variant?: Variant; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", variants[variant])}>
      {variant !== "gray" && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
