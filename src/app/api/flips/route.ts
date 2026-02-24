import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateNetMargin, calculateROI } from "@/lib/utils";
import type { FlipOpportunity } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const minMargin = parseInt(searchParams.get("minMargin") || "0", 10);
  const minRoi = parseFloat(searchParams.get("minRoi") || "0");
  const maxBuyPrice = parseInt(searchParams.get("maxBuyPrice") || "0", 10);
  const minVolume = parseInt(searchParams.get("minVolume") || "0", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const sortBy = searchParams.get("sortBy") || "maxProfit";
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

  // Get the most recent timestamp
  const latestSnapshot = await prisma.priceSnapshot.findFirst({
    orderBy: { timestamp: "desc" },
    select: { timestamp: true },
  });

  if (!latestSnapshot) {
    return NextResponse.json({ data: [], lastSync: null });
  }

  // Get all prices from the latest sync
  const prices = await prisma.priceSnapshot.findMany({
    where: { timestamp: latestSnapshot.timestamp },
    include: { item: true },
  });

  // Get the second-most-recent snapshot timestamp for margin change calculation
  const prevSnapshot = await prisma.priceSnapshot.findFirst({
    where: { timestamp: { lt: latestSnapshot.timestamp } },
    orderBy: { timestamp: "desc" },
    select: { timestamp: true },
  });

  // Build a map of previous margins (itemId -> netMargin)
  const prevMarginMap = new Map<number, number>();
  if (prevSnapshot) {
    const prevPrices = await prisma.priceSnapshot.findMany({
      where: { timestamp: prevSnapshot.timestamp },
      select: { itemId: true, highPrice: true, lowPrice: true },
    });
    for (const prev of prevPrices) {
      if (prev.highPrice && prev.lowPrice && prev.highPrice > prev.lowPrice) {
        prevMarginMap.set(prev.itemId, calculateNetMargin(prev.lowPrice, prev.highPrice));
      }
    }
  }

  // Calculate flip opportunities
  const flips: FlipOpportunity[] = [];

  for (const snapshot of prices) {
    const { highPrice, lowPrice, item } = snapshot;

    // Need both prices to calculate a flip
    if (!highPrice || !lowPrice || lowPrice <= 0 || highPrice <= 0) continue;
    if (highPrice <= lowPrice) continue;

    const netMargin = calculateNetMargin(lowPrice, highPrice);
    if (netMargin <= 0) continue;

    const roi = calculateROI(lowPrice, highPrice);
    const geLimit = item.geLimit || 0;
    const maxProfit = netMargin * geLimit;
    const volume = (snapshot.highVolume || 0) + (snapshot.lowVolume || 0);

    // Apply filters
    if (netMargin < minMargin) continue;
    if (roi < minRoi) continue;
    if (maxBuyPrice > 0 && lowPrice > maxBuyPrice) continue;
    if (minVolume > 0 && volume < minVolume) continue;

    // Compute margin change vs previous sync
    const prevMargin = prevMarginMap.get(item.id);
    let marginChange: number | null = null;
    let marginChangePct: number | null = null;
    if (prevMargin !== undefined) {
      marginChange = netMargin - prevMargin;
      marginChangePct = prevMargin !== 0
        ? Math.round(((netMargin - prevMargin) / Math.abs(prevMargin)) * 10000) / 100
        : null;
    }

    flips.push({
      itemId: item.id,
      name: item.name,
      instantBuy: lowPrice,
      instantSell: highPrice,
      rawMargin: highPrice - lowPrice,
      netMargin,
      roiPercent: Math.round(roi * 100) / 100,
      geLimit,
      maxProfit,
      volume,
      highVolume: snapshot.highVolume || 0,
      lowVolume: snapshot.lowVolume || 0,
      marginChange,
      marginChangePct,
    });
  }

  // Sort
  const sortFn = (a: FlipOpportunity, b: FlipOpportunity) => {
    const key = sortBy as keyof FlipOpportunity;
    const aVal = (a[key] as number) || 0;
    const bVal = (b[key] as number) || 0;
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  };

  flips.sort(sortFn);

  return NextResponse.json({
    data: flips.slice(0, limit),
    total: flips.length,
    lastSync: latestSnapshot.timestamp,
  });
}
