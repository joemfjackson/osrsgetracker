import type { OSRSMappingItem, OSRSLatestData, OSRS5mData, OSRSTimeseriesData } from "./types";

const BASE_URL = "https://prices.runescape.wiki/api/v1/osrs";
const USER_AGENT = "osrs-ge-tracker - GE Flip Tracker App";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`OSRS API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/** Fetch item mapping (ID -> name/metadata) */
export async function fetchMapping(): Promise<OSRSMappingItem[]> {
  return apiFetch<OSRSMappingItem[]>("/mapping");
}

/** Fetch latest instant buy/sell prices for all items */
export async function fetchLatestPrices(): Promise<OSRSLatestData> {
  return apiFetch<OSRSLatestData>("/latest");
}

/** Fetch 5-minute average prices (includes volume data) */
export async function fetch5mPrices(): Promise<OSRS5mData> {
  return apiFetch<OSRS5mData>("/5m");
}

/** Fetch price timeseries for a specific item */
export async function fetchTimeseries(
  itemId: number,
  timestep: "5m" | "1h" | "6h" = "5m"
): Promise<OSRSTimeseriesData> {
  return apiFetch<OSRSTimeseriesData>(
    `/timeseries?id=${itemId}&timestep=${timestep}`
  );
}
