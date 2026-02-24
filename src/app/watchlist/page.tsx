"use client";

import { useState, useEffect } from "react";
import { WatchlistCard } from "@/components/WatchlistCard";
import type { WatchlistItemData } from "@/lib/types";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const triggeredItems = items.filter((i) => i.isTriggered);
  const otherItems = items.filter((i) => !i.isTriggered);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-surface rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
        <p className="text-sm text-muted mt-0.5">
          {items.length === 0
            ? "No items in your watchlist yet"
            : `${items.length} item${items.length !== 1 ? "s" : ""} watched${
                triggeredItems.length > 0
                  ? ` · ${triggeredItems.length} alert${triggeredItems.length !== 1 ? "s" : ""} triggered`
                  : ""
              }`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-border/50 rounded-lg">
          <div className="text-4xl mb-3">👀</div>
          <p className="text-lg text-muted mb-2">Your watchlist is empty</p>
          <p className="text-sm text-muted">
            Browse items and click &quot;Add to Watchlist&quot; to start tracking
          </p>
        </div>
      ) : (
        <>
          {/* Triggered alerts first */}
          {triggeredItems.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-profit mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-profit rounded-full animate-pulse" />
                Active Alerts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triggeredItems.map((item) => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other items */}
          {otherItems.length > 0 && (
            <div>
              {triggeredItems.length > 0 && (
                <h2 className="text-sm font-medium text-muted mb-3">
                  Watching
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherItems.map((item) => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
