"use client";

interface SyncButtonProps {
  onSync: () => void;
  isSyncing: boolean;
  lastSync: string | null;
}

export function SyncButton({ onSync, isSyncing, lastSync }: SyncButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-gold text-black text-sm font-medium rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isSyncing ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Prices
          </>
        )}
      </button>
      {lastSync && (
        <span className="text-xs text-muted">
          Last sync: {new Date(lastSync).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
