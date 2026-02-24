"use client";

interface BudgetFilterProps {
  budget: string;
  onBudgetChange: (value: string) => void;
  minRoi: number;
  onMinRoiChange: (value: number) => void;
  minMargin: string;
  onMinMarginChange: (value: string) => void;
  minVolume: string;
  onMinVolumeChange: (value: string) => void;
}

const BUDGET_PRESETS = [
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
  { label: "1M", value: 1_000_000 },
  { label: "5M", value: 5_000_000 },
  { label: "10M", value: 10_000_000 },
  { label: "50M", value: 50_000_000 },
];

export function BudgetFilter({
  budget,
  onBudgetChange,
  minRoi,
  onMinRoiChange,
  minMargin,
  onMinMarginChange,
  minVolume,
  onMinVolumeChange,
}: BudgetFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Budget */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted font-medium uppercase tracking-wide">
          Max Buy Price
        </label>
        <div className="flex gap-1">
          <input
            type="text"
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Any"
            className="w-28 px-3 py-1.5 bg-surface border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
          />
          <div className="flex gap-0.5">
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => onBudgetChange(String(p.value))}
                className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                  budget === String(p.value)
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted hover:text-foreground hover:border-border"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Min ROI */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted font-medium uppercase tracking-wide">
          Min ROI: {minRoi}%
        </label>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={minRoi}
          onChange={(e) => onMinRoiChange(parseFloat(e.target.value))}
          className="w-32 accent-gold"
        />
      </div>

      {/* Min Margin */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted font-medium uppercase tracking-wide">
          Min Margin
        </label>
        <input
          type="text"
          value={minMargin}
          onChange={(e) => onMinMarginChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Any"
          className="w-28 px-3 py-1.5 bg-surface border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
        />
      </div>

      {/* Min Volume */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted font-medium uppercase tracking-wide">
          Min Volume
        </label>
        <input
          type="text"
          value={minVolume}
          onChange={(e) => onMinVolumeChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Any"
          className="w-28 px-3 py-1.5 bg-surface border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50"
        />
      </div>
    </div>
  );
}
