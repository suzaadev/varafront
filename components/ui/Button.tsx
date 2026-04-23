import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "default" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-accent hover:bg-accent/90 text-white border-accent",
  default: "bg-bg-card hover:bg-bg-hover text-text-primary border-border-md",
  danger: "bg-danger/10 hover:bg-danger/20 text-danger border-danger/20",
  ghost: "bg-transparent hover:bg-white/5 text-text-secondary border-transparent",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
}

export function Button({ variant = "default", size = "md", loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium border rounded-lg transition-all active:scale-95",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        variants[variant],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
