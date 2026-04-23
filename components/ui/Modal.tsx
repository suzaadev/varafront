"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cn("bg-bg-card border border-border-md rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto", className)}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        {description && <p className="text-sm text-text-secondary mb-5">{description}</p>}
        {children}
      </div>
    </div>
  );
}
