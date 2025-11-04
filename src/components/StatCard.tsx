// src/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
<div className="stat shadow rounded-lg bg-primary text-[var(--foreground)] w-[200px] min-w-[200px] mx-[10px] my-[10px] flex-shrink-0"
style={{ borderRadius: '12px' }}
>
  {icon && (
    <div className="stat-figure text-[var(--foreground)]">
      {icon}
    </div>
  )}
  <div className="stat-title whitespace-normal break-words text-[var(--foreground)]">{title}</div>
  <div className="stat-value text-2xl whitespace-normal break-all text-[var(--foreground)]">{value}</div>
</div>
  );
}