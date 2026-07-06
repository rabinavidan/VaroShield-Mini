interface StatCardProps {
  label: string;
  value: number;
  testId?: string;
  tone?: "default" | "warning" | "critical";
}

export default function StatCard({ label, value, testId, tone = "default" }: StatCardProps) {
  const toneClass = tone !== "default" ? ` stat-card--${tone}` : "";
  return (
    <div className={`stat-card${toneClass}`} data-testid={testId}>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
