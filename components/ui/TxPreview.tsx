export function TxPreview({ rows }: { rows: { label: string; value: string; highlight?: "green" | "red" | "amber" }[] }) {
  const colors = { green: "#10B981", red: "#EF4444", amber: "#F59E0B" };
  const bgs = { green: "#F0FDF4", red: "#FEF2F2", amber: "#FFFBEB" };
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 16px", margin: "16px 0" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 13, gap: 12, borderBottom: i < rows.length - 1 ? "1px solid #F1F5F9" : "none" }}>
          <span style={{ color: "#64748B" }}>{row.label}</span>
          <span style={{
            fontWeight: 500, textAlign: "right",
            color: row.highlight ? colors[row.highlight] : "#0F172A",
            fontSize: row.highlight ? 12 : 13,
            background: row.highlight ? bgs[row.highlight] : "transparent",
            padding: row.highlight ? "2px 8px" : "0",
            borderRadius: row.highlight ? 6 : 0,
          }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
