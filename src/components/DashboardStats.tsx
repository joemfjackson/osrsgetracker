"use client";

import { formatGP } from "@/lib/utils";
import type { FlipOpportunity } from "@/lib/types";

interface DashboardStatsProps {
  flips: FlipOpportunity[];
  lastSync: string | null;
}

export function DashboardStats({ flips, lastSync }: DashboardStatsProps) {
  if (flips.length === 0) return null;

  const bestRoi = flips.reduce((best, f) =>
    f.roiPercent > best.roiPercent ? f : best
  );

  const highestMargin = flips.reduce((best, f) =>
    f.netMargin > best.netMargin ? f : best
  );

  const profitableCount = flips.filter((f) => f.netMargin > 0).length;

  const syncTimeStr = lastSync
    ? new Date(lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatPill label="Best ROI" value={`${bestRoi.roiPercent}%`} sub={bestRoi.name} accent />
      <StatPill label="Highest Margin" value={`${formatGP(highestMargin.netMargin)} gp`} sub={highestMargin.name} accent />
      <StatPill label="Profitable Items" value={String(profitableCount)} />
      <StatPill label="Last Sync" value={syncTimeStr} />
    </div>
  );
}

function StatPill({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3">
      <span className="text-xs text-muted block">{label}</span>
      <span className={`text-sm font-bold block ${accent ? "text-gold" : "text-foreground"}`}>
        {value}
      </span>
      {sub && (
        <span className="text-xs text-muted truncate block">{sub}</span>
      )}
    </div>
  );
}
