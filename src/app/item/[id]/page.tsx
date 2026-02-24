"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PriceChart } from "@/components/PriceChart";
import { AddToWatchlistModal } from "@/components/AddToWatchlistModal";
import { ROIBadge } from "@/components/ROIBadge";
import { formatGP, calculateNetMargin, calculateROI } from "@/lib/utils";

interface ItemData {
  item: {
    id: number;
    name: string;
    examine: string | null;
    members: boolean;
    highalch: number | null;
    geLimit: number | null;
  };
  latestPrice: {
    highPrice: number | null;
    lowPrice: number | null;
    timestamp: string;
  } | null;
  timeseries: Array<{
    timestamp: string;
    highPrice: number | null;
    lowPrice: number | null;
  }>;
}

type Timeframe = "1h" | "6h" | "24h";

export default function ItemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [data, setData] = useState<ItemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("24h");

  useEffect(() => {
    async function fetchItem() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/item/${id}?timeframe=${timeframe}`);
        if (!res.ok) {
          setError("Item not found");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load item");
      } finally {
        setIsLoading(false);
      }
    }
    fetchItem();
  }, [id, timeframe]);

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="h-32 bg-surface rounded animate-pulse" />
        <div className="h-80 bg-surface rounded animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted mb-4">{error || "Item not found"}</p>
        <Link
          href="/"
          className="text-gold hover:underline"
        >
          Back to Flip Finder
        </Link>
      </div>
    );
  }

  const { item, latestPrice, timeseries } = data;
  const buyPrice = latestPrice?.lowPrice;
  const sellPrice = latestPrice?.highPrice;
  const netMargin =
    buyPrice && sellPrice ? calculateNetMargin(buyPrice, sellPrice) : null;
  const roi =
    buyPrice && sellPrice ? calculateROI(buyPrice, sellPrice) : null;
  const maxProfit =
    netMargin && item.geLimit ? netMargin * item.geLimit : null;

  // Profit calculator
  const qty = parseInt(quantity, 10) || 0;
  const totalCost = buyPrice ? buyPrice * qty : 0;
  const totalRevenue = sellPrice ? sellPrice * qty : 0;
  const totalTax = sellPrice ? Math.floor(sellPrice * 0.01) * qty : 0;
  const totalNetProfit = totalRevenue - totalCost - totalTax;
  const profitPerItem = qty > 0 ? Math.floor(totalNetProfit / qty) : 0;
  const exceedsLimit = item.geLimit ? qty > item.geLimit : false;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
          {item.examine && (
            <p className="text-sm text-muted mt-1 italic">{item.examine}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded ${item.members ? "bg-gold/15 text-gold" : "bg-blue-500/15 text-blue-400"}`}>
              {item.members ? "Members" : "Free-to-play"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowWatchlistModal(true)}
          className="px-4 py-2 border border-gold/50 text-gold text-sm font-medium rounded-lg hover:bg-gold/10 transition-colors shrink-0"
        >
          + Add to Watchlist
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Instant Buy"
          value={buyPrice ? `${formatGP(buyPrice)} gp` : "—"}
        />
        <StatCard
          label="Instant Sell"
          value={sellPrice ? `${formatGP(sellPrice)} gp` : "—"}
        />
        <StatCard
          label="Net Margin"
          value={netMargin !== null ? `${formatGP(netMargin)} gp` : "—"}
          highlight={netMargin !== null && netMargin > 0}
        />
        <StatCard
          label="ROI"
          value={roi !== null ? <ROIBadge roi={Math.round(roi * 100) / 100} /> : "—"}
        />
        <StatCard
          label="GE Limit"
          value={item.geLimit ? formatGP(item.geLimit) : "—"}
        />
        <StatCard
          label="High Alch"
          value={item.highalch ? `${formatGP(item.highalch)} gp` : "—"}
        />
      </div>

      {/* Max Profit */}
      {maxProfit !== null && maxProfit > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <span className="text-xs text-muted block mb-1">
            Potential Profit per GE Limit Cycle (4hr)
          </span>
          <span className="text-2xl font-bold text-profit">
            {formatGP(maxProfit)} gp
          </span>
        </div>
      )}

      {/* Profit Calculator */}
      {buyPrice && sellPrice && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted mb-3">Profit Calculator</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted uppercase tracking-wide">Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter qty"
                className="w-32 px-3 py-1.5 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
              />
              {exceedsLimit && (
                <span className="text-xs text-loss">
                  Exceeds GE limit of {formatGP(item.geLimit!)} per 4hrs
                </span>
              )}
            </div>
            {qty > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
                <CalcStat label="Total Cost" value={`${formatGP(totalCost)} gp`} />
                <CalcStat label="Revenue" value={`${formatGP(totalRevenue)} gp`} />
                <CalcStat label="Tax (1%)" value={`${formatGP(totalTax)} gp`} />
                <CalcStat label="Net Profit" value={`${formatGP(totalNetProfit)} gp`} highlight={totalNetProfit > 0} />
                <CalcStat label="Per Item" value={`${formatGP(profitPerItem)} gp`} highlight={profitPerItem > 0} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted">
            Price History
          </h2>
          <div className="flex gap-1">
            {(["1h", "6h", "24h"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  timeframe === tf
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PriceChart data={timeseries} itemName={item.name} timeframe={timeframe} />
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#ff981f] inline-block rounded" />
            Instant Sell (High)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#4dabf7] inline-block rounded" />
            Instant Buy (Low)
          </span>
        </div>
      </div>

      {/* Watchlist Modal */}
      <AddToWatchlistModal
        itemId={item.id}
        itemName={item.name}
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        onAdded={() => setShowWatchlistModal(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <span className="text-xs text-muted block mb-1">{label}</span>
      <span
        className={`text-sm font-bold ${highlight ? "text-profit" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function CalcStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <span className="text-xs text-muted block">{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-profit" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
