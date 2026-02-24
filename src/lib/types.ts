export interface Item {
  id: number;
  name: string;
  examine: string | null;
  members: boolean;
  highalch: number | null;
  geLimit: number | null;
  icon: string | null;
}

export interface FlipOpportunity {
  itemId: number;
  name: string;
  instantBuy: number;   // Price to buy instantly (low_price - matching a sell offer)
  instantSell: number;  // Price to sell instantly (high_price - matching a buy offer)
  rawMargin: number;
  netMargin: number;    // After 1% tax
  roiPercent: number;
  geLimit: number;
  maxProfit: number;    // Per 4hr limit cycle
  volume: number;
  highVolume: number;
  lowVolume: number;
  marginChange: number | null;
  marginChangePct: number | null;
}

export interface PricePoint {
  timestamp: Date;
  highPrice: number | null;
  lowPrice: number | null;
}

export interface WatchlistItemData {
  id: number;
  itemId: number;
  itemName: string;
  minMargin: number | null;
  minRoi: number | null;
  maxBuyPrice: number | null;
  notes: string | null;
  currentMargin?: number;
  currentRoi?: number;
  isTriggered?: boolean;
  instantBuy?: number;
  instantSell?: number;
}

// OSRS Wiki API response types
export interface OSRSMappingItem {
  id: number;
  name: string;
  examine: string;
  members: boolean;
  lowalch: number;
  highalch: number;
  limit: number;
  value: number;
  icon: string;
}

export interface OSRSLatestData {
  data: Record<string, {
    high: number | null;
    highTime: number | null;
    low: number | null;
    lowTime: number | null;
  }>;
}

export interface OSRS5mData {
  data: Record<string, {
    avgHighPrice: number | null;
    highPriceVolume: number;
    avgLowPrice: number | null;
    lowPriceVolume: number;
  }>;
}

export interface OSRSTimeseriesData {
  data: Array<{
    timestamp: number;
    avgHighPrice: number | null;
    avgLowPrice: number | null;
    highPriceVolume: number;
    lowPriceVolume: number;
  }>;
}
