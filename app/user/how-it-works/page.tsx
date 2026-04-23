"use client";

const T = {
  canvas: "#F7F8FA",
  card: "#FFFFFF",
  elevated: "#FCFCFD",
  hover: "#F8FAFC",
  border: "#EAECF0",
  borderSubtle: "#F2F4F7",
  ink: "#0B1220",
  graphite: "#475467",
  muted: "#98A2B3",
  disabled: "#D0D5DD",
  pulse: "#5B5CEB",
  pulseHover: "#4B4CDB",
  violet: "#7A5AF8",
  violetTint: "#F4F1FF",
  violetMuted: "#D9D0FC",
  cyan: "#06AED4",
  cyanTint: "#ECFDFF",
  cyanMuted: "#A5E8F5",
  success: "#12B76A",
  warning: "#F79009",
};

const shadow = {
  card: "0 1px 2px rgba(16,24,40,.04), 0 4px 12px rgba(16,24,40,.04)",
  hover: "0 2px 4px rgba(16,24,40,.06), 0 12px 32px rgba(16,24,40,.09)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.violetTint, border: `1px solid ${T.violetMuted}`, borderRadius: 999, padding: "4px 12px", marginBottom: 16 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.pulse }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: T.pulse, letterSpacing: "0.4px", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function StepNumber({ n, color }: { n: number; color: string }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: color === "violet" ? T.violetTint : T.cyanTint, border: `1.5px solid ${color === "violet" ? T.violetMuted : T.cyanMuted}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: color === "violet" ? T.violet : T.cyan }}>{n}</span>
    </div>
  );
}

function Step({ n, color, title, body }: { n: number; color: string; title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <StepNumber n={n} color={color} />
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: T.graphite, lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

function RoleCard({ side, icon, role, tagline, steps, highlight }: { side: "user" | "merchant"; icon: string; role: string; tagline: string; steps: { title: string; body: string }[]; highlight: string }) {
  const isUser = side === "user";
  const color = isUser ? "violet" : "cyan";
  const accent = isUser ? T.violet : T.cyan;
  const tint = isUser ? T.violetTint : T.cyanTint;
  const muted = isUser ? T.violetMuted : T.cyanMuted;

  return (
    <div style={{ background: T.card, border: `1px solid ${T.borderSubtle}`, borderRadius: 20, padding: 32, boxShadow: shadow.card, display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Role header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: tint, border: `1.5px solid ${muted}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{isUser ? "For Users" : "For Merchants"}</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: T.ink, marginBottom: 4 }}>{role}</div>
          <div style={{ fontSize: 13.5, color: T.graphite, lineHeight: 1.5 }}>{tagline}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: T.borderSubtle }} />

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {steps.map((s, i) => (
          <Step key={i} n={i + 1} color={color} title={s.title} body={s.body} />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: T.borderSubtle }} />

      {/* Highlight */}
      <div style={{ background: tint, border: `1px solid ${muted}`, borderRadius: 12, padding: "14px 18px", fontSize: 13, color: accent, fontWeight: 500, lineHeight: 1.6 }}>
        {highlight}
      </div>
    </div>
  );
}

function GuaranteeCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 22, boxShadow: shadow.card }}>
      <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: T.graphite, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function CompareRow({ label, user, merchant }: { label: string; user: string; merchant: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, padding: "14px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
      <div style={{ fontSize: 13, color: T.graphite, display: "flex", alignItems: "center" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.violet, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: T.ink, fontWeight: 500 }}>{user}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.cyan, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: T.ink, fontWeight: 500 }}>{merchant}</span>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <SectionLabel>Protocol Overview</SectionLabel>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1.2px", color: T.ink, marginBottom: 16, lineHeight: 1.15 }}>
          Recurring payments,<br />
          <span style={{ color: T.pulse }}>enforced on-chain.</span>
        </h1>
        <p style={{ fontSize: 16, color: T.graphite, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
          Oravara replaces trust-based billing with cryptographic guarantees. Users authorize exact terms. Merchants collect when due. The program enforces every rule — no exceptions, no intermediaries.
        </p>
      </div>

      {/* How it flows — visual diagram */}
      <div style={{ background: T.card, border: `1px solid ${T.borderSubtle}`, borderRadius: 20, padding: "32px 40px", marginBottom: 64, boxShadow: shadow.card }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.7px", textAlign: "center", marginBottom: 32 }}>Payment Flow</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", rowGap: 16 }}>
          {[
            { icon: "👤", label: "User Wallet", sub: "Signs transactions" },
            null,
            { icon: "🏦", label: "Vault PDA", sub: "Holds SOL on-chain" },
            null,
            { icon: "📋", label: "Subscription PDA", sub: "Stores payment terms" },
            null,
            { icon: "🏪", label: "Merchant Wallet", sub: "Triggers collection" },
          ].map((item, i) => {
            if (!item) return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 8px", color: T.muted, fontSize: 18 }}>→</div>
            );
            return (
              <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: T.hover, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 8px" }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{item.label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{item.sub}</div>
              </div>
            );
          })}
        </div>
        {/* Fee split bar */}
        <div style={{ marginTop: 32, maxWidth: 480, margin: "32px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: T.graphite }}>
            <span>On every collection</span>
            <span style={{ color: T.muted }}>1% protocol fee</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 99, background: T.violetMuted }} />
            <div style={{ flex: 1, background: T.cyanMuted }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: T.muted }}>
            <span style={{ color: T.violet, fontWeight: 500 }}>99% → Merchant</span>
            <span style={{ color: T.cyan, fontWeight: 500 }}>1% → Protocol</span>
          </div>
        </div>
      </div>

      {/* Two role cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 64 }}>
        <RoleCard
          side="user"
          icon="🔐"
          role="The User"
          tagline="Deposit SOL into your personal vault, then authorize merchants to collect fixed recurring payments. You set every term — the merchant cannot deviate."
          steps={[
            { title: "Create a vault", body: "Your vault is a Program Derived Account — a smart contract wallet owned exclusively by your public key. No one else can withdraw from it." },
            { title: "Deposit SOL", body: "Transfer SOL from your wallet into your vault. The vault balance is tracked on-chain and always visible. You can top it up or withdraw at any time." },
            { title: "Authorize a merchant", body: "Create a subscription by specifying the merchant wallet, amount per cycle, interval, and optional maximum number of cycles. These terms are stored permanently on-chain." },
            { title: "Cancel anytime", body: "You can cancel any subscription instantly. The cancellation takes effect at the moment of the transaction — the merchant cannot collect again after that block." },
          ]}
          highlight="✓ You cannot be overcharged. You cannot be charged early. You cannot be charged after cancellation. These are program-enforced guarantees, not policy."
        />
        <RoleCard
          side="merchant"
          icon="💼"
          role="The Merchant"
          tagline="Collect authorized payments when they are due. The program verifies every condition on-chain before releasing funds — no failed charges, no disputes about terms."
          steps={[
            { title: "Share your wallet address", body: "Give your Solana wallet address to subscribers. They use it to create a subscription that authorizes your wallet specifically. No integration required." },
            { title: "Wait for payment to be due", body: "The subscription has a next_due_at timestamp. The program blocks collection until that timestamp is reached. You can check it at any time by reading the subscription account." },
            { title: "Trigger collection", body: "Sign and send a collect_payment transaction. The program checks all five rules atomically: active, due, funded, within max cycles, and correct merchant. If all pass, funds transfer immediately." },
            { title: "Batch collect", body: "Use the Collect page to collect from all due subscriptions in one session. Each collection is a separate transaction so partial success is possible if one vault is underfunded." },
          ]}
          highlight="✓ Authorized amount transfers directly to your wallet minus the 1% protocol fee. No invoice generation, no payment processor, no settlement delay."
        />
      </div>

      {/* Five guarantees */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <SectionLabel>On-Chain Guarantees</SectionLabel>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.7px", color: T.ink, marginBottom: 8 }}>Five rules the program enforces</h2>
          <p style={{ fontSize: 14, color: T.graphite, maxWidth: 460, margin: "0 auto" }}>Every collect_payment instruction runs these checks before a single lamport moves. All five must pass or the transaction reverts.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {[
            { icon: "✓", title: "Active", body: "Subscription must not be cancelled or expired." },
            { icon: "⏱", title: "Due", body: "Current timestamp must be past next_due_at." },
            { icon: "💰", title: "Funded", body: "Vault must hold at least the subscription amount." },
            { icon: "🔢", title: "Cycles", body: "Must not exceed the authorized max cycles." },
            { icon: "🔑", title: "Merchant", body: "Signer must be the exact authorized merchant." },
          ].map((g, i) => (
            <GuaranteeCard key={i} icon={g.icon} title={g.title} body={g.body} />
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ background: T.card, border: `1px solid ${T.borderSubtle}`, borderRadius: 20, padding: "32px 36px", marginBottom: 64, boxShadow: shadow.card }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 24 }}>Role Comparison</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, paddingBottom: 12, borderBottom: `2px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Action</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.violet }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.violet, textTransform: "uppercase", letterSpacing: "0.5px" }}>User</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.cyan }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.cyan, textTransform: "uppercase", letterSpacing: "0.5px" }}>Merchant</span>
          </div>
        </div>
        {[
          { label: "Creates vault", user: "Yes — one per wallet", merchant: "Not required" },
          { label: "Deposits SOL", user: "Yes — to fund vault", merchant: "No" },
          { label: "Withdraws SOL", user: "Yes — anytime", merchant: "No access to vault" },
          { label: "Creates subscription", user: "Yes — sets all terms", merchant: "No — receives authorization" },
          { label: "Cancels subscription", user: "Yes — instantly", merchant: "Cannot cancel" },
          { label: "Triggers collection", user: "Cannot collect", merchant: "Yes — when due" },
          { label: "Changes amount", user: "No — create new sub", merchant: "No — cannot change" },
          { label: "Signs transactions", user: "deposit, withdraw, create, cancel", merchant: "collect_payment" },
        ].map((row, i) => (
          <CompareRow key={i} label={row.label} user={row.user} merchant={row.merchant} />
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <SectionLabel>Common Questions</SectionLabel>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.7px", color: T.ink }}>Frequently asked</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { q: "What happens if my vault runs out of SOL?", a: "The collection will fail with InsufficientFunds. The subscription remains active — the merchant can retry once you deposit more SOL. No late fees, no penalties." },
            { q: "Can a merchant change the amount after I authorize?", a: "No. The amount is stored in the Subscription account at creation time. To change the terms, you would need to cancel and create a new subscription with the new amount." },
            { q: "What happens when I cancel?", a: "The subscription is permanently deactivated on-chain. Future collect_payment calls will fail with SubscriptionInactive. Your vault balance is unaffected — you can withdraw it anytime." },
            { q: "Can Oravara freeze or access my vault?", a: "No. The vault is a PDA owned by your wallet key. Only your wallet can sign the withdraw instruction. The program has no admin key that can force transfers." },
            { q: "What is the protocol fee?", a: "1% (100 basis points) of each collected amount. This is deducted automatically and sent to the protocol wallet. The fee rate is adjustable between 0.1% and 3% by the protocol authority." },
            { q: "Is this audited?", a: "The program is currently on Solana devnet. A security audit is required before mainnet deployment. The program source is open on GitHub for review." },
            { q: "What is max_cycles?", a: "An optional cap on the number of payment cycles. Set it to 0 for unlimited recurring payments. Set it to a number like 12 for a fixed-term subscription. The program auto-deactivates the subscription when the cap is reached." },
            { q: "Can I have multiple subscriptions with the same merchant?", a: "Yes. Each subscription uses a seed_index to derive a unique PDA. You can create multiple subscriptions with the same merchant at different amounts or intervals by using different seed indexes." },
          ].map((faq, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 22, boxShadow: shadow.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 8, lineHeight: 1.4 }}>{faq.q}</div>
              <div style={{ fontSize: 13.5, color: T.graphite, lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg, ${T.violetTint} 0%, ${T.cyanTint} 100%)`, border: `1px solid ${T.violetMuted}`, borderRadius: 20, padding: "48px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.pulse, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Ready to start</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.6px", color: T.ink, marginBottom: 12 }}>Connect your wallet to get started</h2>
        <p style={{ fontSize: 14, color: T.graphite, maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>Create a vault, deposit SOL, and authorize your first subscription in under two minutes. Everything is on-chain from the first click.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="/user" style={{ background: T.pulse, color: "white", textDecoration: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, boxShadow: "0 2px 8px rgba(91,92,235,0.35)" }}>Go to Vault →</a>
          <a href="/merchant" style={{ background: T.card, color: T.ink, textDecoration: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, border: `1px solid ${T.border}` }}>Merchant Dashboard →</a>
        </div>
      </div>

    </div>
  );
}
