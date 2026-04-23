export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="text-sm text-text-secondary mb-1.5">{title}</div>
      <div className="text-xs text-text-tertiary mb-4">{description}</div>
      {action}
    </div>
  );
}
