"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FlipTable } from "@/components/FlipTable";
import { BudgetFilter } from "@/components/BudgetFilter";
import { ItemSearch } from "@/components/ItemSearch";
import { SyncButton } from "@/components/SyncButton";
import { DashboardStats } from "@/components/DashboardStats";
import type { FlipOpportunity } from "@/lib/types";

export default function HomePage() {
  const [flips, setFlips] = useState<FlipOpportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const autoSyncDone = useRef(false);

  // Filters
  const [budget, setBudget] = useState("");
  const [minRoi, setMinRoi] = useState(0);
  const [minMargin, setMinMargin] = useState("");
  const [minVolume, setMinVolume] = useState("");
  const [sortBy, setSortBy] = useState("maxProfit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchFlips = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (budget) params.set("maxBuyPrice", budget);
      if (minRoi > 0) params.set("minRoi", String(minRoi));
      if (minMargin) params.set("minMargin", minMargin);
      if (minVolume) params.set("minVolume", minVolume);
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);
      params.set("limit", "100");

      const res = await fetch(`/api/flips?${params}`);
      const data = await res.json();
      setFlips(data.data || []);
      setTotal(data.total || 0);
      setLastSync(data.lastSync || null);
    } catch (error) {
      console.error("Failed to fetch flips:", error);
    } finally {
      setIsLoading(false);
    }
  }, [budget, minRoi, minMargin, minVolume, sortBy, sortDir]);

  const triggerSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) {
        await fetchFlips();
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, fetchFlips]);

  // Auto-sync on mount if data is stale (>5 min) or missing
  useEffect(() => {
    if (autoSyncDone.current) return;
    autoSyncDone.current = true;

    async function checkAndSync() {
      try {
        const res = await fetch("/api/sync");
        const data = await res.json();
        const lastSyncTime = data.lastSync ? new Date(data.lastSync).getTime() : 0;
        const staleThreshold = 5 * 60 * 1000; // 5 minutes

        if (!lastSyncTime || Date.now() - lastSyncTime > staleThreshold) {
          await triggerSync();
        } else {
          await fetchFlips();
        }
      } catch {
        await fetchFlips();
      }
    }

    checkAndSync();
  }, [triggerSync, fetchFlips]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchFlips, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchFlips]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Flip Finder
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {isSyncing
              ? "Syncing prices..."
              : total > 0
                ? `${total} opportunities found`
                : "Sync prices to find flip opportunities"}
          </p>
        </div>
        <SyncButton onSync={triggerSync} isSyncing={isSyncing} lastSync={lastSync} />
      </div>

      {/* Search */}
      <ItemSearch />

      {/* Dashboard Stats */}
      <DashboardStats flips={flips} lastSync={lastSync} />

      {/* Filters */}
      <BudgetFilter
        budget={budget}
        onBudgetChange={setBudget}
        minRoi={minRoi}
        onMinRoiChange={setMinRoi}
        minMargin={minMargin}
        onMinMarginChange={setMinMargin}
        minVolume={minVolume}
        onMinVolumeChange={setMinVolume}
      />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-surface rounded animate-pulse"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ) : (
        <FlipTable
          data={flips}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
