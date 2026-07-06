interface StatCardProps {
  label: string;
  value: number;
  testId?: string;
}

export default function StatCard({ label, value, testId }: StatCardProps) {
  return (
    <div className="stat-card" data-testid={testId}>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
