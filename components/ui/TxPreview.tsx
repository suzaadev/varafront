export function TxPreview({ rows }: { rows: { label: string; value: string; highlight?: "green" | "red" | "amber" }[] }) {
  const colors = { green: "text-success", red: "text-danger", amber: "text-warning" };
  return (
    <div className="bg-bg-input border border-border rounded-lg px-4 py-3 my-4 space-y-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-between items-center text-sm gap-3">
          <span className="text-text-secondary">{row.label}</span>
          <span className={`font-medium text-right ${row.highlight ? colors[row.highlight] : "text-text-primary"}`}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
