"use client";

import { useState } from "react";

interface AddToWatchlistModalProps {
  itemId: number;
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddToWatchlistModal({
  itemId,
  itemName,
  isOpen,
  onClose,
  onAdded,
}: AddToWatchlistModalProps) {
  const [minMargin, setMinMargin] = useState("");
  const [minRoi, setMinRoi] = useState("");
  const [maxBuyPrice, setMaxBuyPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          minMargin: minMargin ? parseInt(minMargin, 10) : null,
          minRoi: minRoi ? parseFloat(minRoi) : null,
          maxBuyPrice: maxBuyPrice ? parseInt(maxBuyPrice, 10) : null,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        onAdded();
        onClose();
        setMinMargin("");
        setMinRoi("");
        setMaxBuyPrice("");
        setNotes("");
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-gold mb-1">Add to Watchlist</h2>
        <p className="text-sm text-muted mb-4">{itemName}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">
              Min Margin (gp)
            </label>
            <input
              type="text"
              value={minMargin}
              onChange={(e) =>
                setMinMargin(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Optional"
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">
              Min ROI (%)
            </label>
            <input
              type="text"
              value={minRoi}
              onChange={(e) =>
                setMinRoi(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="Optional"
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">
              Max Buy Price (gp)
            </label>
            <input
              type="text"
              value={maxBuyPrice}
              onChange={(e) =>
                setMaxBuyPrice(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Optional"
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm bg-gold text-black rounded-lg font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add to Watchlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
