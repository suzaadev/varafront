"use client";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-in" style={{
        background: "white", border: "1px solid #E5E7EB",
        borderRadius: 20, padding: 28, width: "100%", maxWidth: 440,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px", color: "#0F172A", marginBottom: description ? 6 : 20 }}>{title}</div>
        {description && <div style={{ fontSize: 13.5, color: "#64748B", marginBottom: 20, lineHeight: 1.5 }}>{description}</div>}
        {children}
      </div>
    </div>
  );
}
