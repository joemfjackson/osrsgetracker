"use client";

import { useRouter } from "next/navigation";
import { formatGP, getRoiColor } from "@/lib/utils";
import { ROIBadge } from "./ROIBadge";
import type { FlipOpportunity } from "@/lib/types";

interface FlipTableProps {
  data: FlipOpportunity[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (column: string) => void;
}

const COLUMNS = [
  { key: "name", label: "Item", align: "left" as const },
  { key: "instantBuy", label: "Buy Price", align: "right" as const },
  { key: "instantSell", label: "Sell Price", align: "right" as const },
  { key: "netMargin", label: "Margin", align: "right" as const },
  { key: "roiPercent", label: "ROI", align: "right" as const },
  { key: "geLimit", label: "GE Limit", align: "right" as const },
  { key: "maxProfit", label: "Profit/Limit", align: "right" as const },
  { key: "volume", label: "Volume", align: "right" as const },
];

export function FlipTable({ data, sortBy, sortDir, onSort }: FlipTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg mb-2">No flip opportunities found</p>
        <p className="text-sm">Try adjusting your filters or sync price data first</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-border">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`px-4 py-3 font-medium text-muted cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortBy === col.key && (
                    <span className="text-gold">
                      {sortDir === "desc" ? "▼" : "▲"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((flip) => (
            <tr
              key={flip.itemId}
              onClick={() => router.push(`/item/${flip.itemId}`)}
              className="border-b border-border/50 hover:bg-surface/80 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {flip.name}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatGP(flip.instantBuy)} gp
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatGP(flip.instantSell)} gp
              </td>
              <td className={`px-4 py-3 text-right tabular-nums font-medium ${getRoiColor(flip.roiPercent)}`}>
                <span className="inline-flex items-center gap-1 justify-end">
                  {formatGP(flip.netMargin)} gp
                  {flip.marginChange !== null && flip.marginChange !== 0 && (
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${flip.marginChange > 0 ? "text-profit" : "text-loss"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      {flip.marginChange > 0 ? (
                        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                      )}
                    </svg>
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <ROIBadge roi={flip.roiPercent} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted">
                {flip.geLimit > 0 ? formatGP(flip.geLimit) : "—"}
              </td>
              <td className={`px-4 py-3 text-right tabular-nums font-medium ${getRoiColor(flip.roiPercent)}`}>
                {flip.maxProfit > 0 ? `${formatGP(flip.maxProfit)} gp` : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted">
                {formatGP(flip.volume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
