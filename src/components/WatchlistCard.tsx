"use client";

import Link from "next/link";
import { formatGP, getRoiColor, cn } from "@/lib/utils";
import { ROIBadge } from "./ROIBadge";
import type { WatchlistItemData } from "@/lib/types";

interface WatchlistCardProps {
  item: WatchlistItemData;
  onDelete: (id: number) => void;
}

export function WatchlistCard({ item, onDelete }: WatchlistCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        item.isTriggered
          ? "border-profit/50 bg-profit/5"
          : "border-border bg-surface"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/item/${item.itemId}`}
          className="text-lg font-bold text-foreground hover:text-gold transition-colors"
        >
          {item.itemName}
        </Link>
        <div className="flex items-center gap-2">
          {item.isTriggered && (
            <span className="text-xs bg-profit/20 text-profit px-2 py-0.5 rounded font-bold animate-pulse">
              ALERT
            </span>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-muted hover:text-loss transition-colors p-1"
            title="Remove from watchlist"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Current prices */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-xs text-muted block">Buy</span>
          <span className="text-sm font-medium tabular-nums">
            {item.instantBuy ? `${formatGP(item.instantBuy)} gp` : "—"}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted block">Sell</span>
          <span className="text-sm font-medium tabular-nums">
            {item.instantSell ? `${formatGP(item.instantSell)} gp` : "—"}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted block">Margin</span>
          <span className={`text-sm font-bold tabular-nums ${item.currentMargin ? getRoiColor(item.currentRoi || 0) : "text-muted"}`}>
            {item.currentMargin !== undefined ? `${formatGP(item.currentMargin)} gp` : "—"}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted block">ROI</span>
          {item.currentRoi !== undefined ? (
            <ROIBadge roi={item.currentRoi} />
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </div>
      </div>

      {/* Alert thresholds */}
      {(item.minMargin || item.minRoi || item.maxBuyPrice) && (
        <div className="border-t border-border/50 pt-2 mt-2">
          <span className="text-xs text-muted block mb-1">Alert when:</span>
          <div className="flex flex-wrap gap-2">
            {item.minMargin && (
              <span className="text-xs bg-background px-2 py-0.5 rounded text-muted">
                Margin &ge; {formatGP(item.minMargin)} gp
              </span>
            )}
            {item.minRoi && (
              <span className="text-xs bg-background px-2 py-0.5 rounded text-muted">
                ROI &ge; {item.minRoi}%
              </span>
            )}
            {item.maxBuyPrice && (
              <span className="text-xs bg-background px-2 py-0.5 rounded text-muted">
                Buy &le; {formatGP(item.maxBuyPrice)} gp
              </span>
            )}
          </div>
        </div>
      )}

      {item.notes && (
        <p className="text-xs text-muted mt-2 italic">{item.notes}</p>
      )}
    </div>
  );
}
