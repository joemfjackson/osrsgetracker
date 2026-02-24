import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateNetMargin, calculateROI } from "@/lib/utils";
import type { WatchlistItemData } from "@/lib/types";

export async function GET() {
  const watchlistItems = await prisma.watchlistItem.findMany({
    include: { item: true },
    orderBy: { createdAt: "desc" },
  });

  // Get latest prices for all watchlist items
  const latestSnapshot = await prisma.priceSnapshot.findFirst({
    orderBy: { timestamp: "desc" },
    select: { timestamp: true },
  });

  const result: WatchlistItemData[] = [];

  for (const wi of watchlistItems) {
    let currentMargin: number | undefined;
    let currentRoi: number | undefined;
    let isTriggered = false;
    let instantBuy: number | undefined;
    let instantSell: number | undefined;

    if (latestSnapshot) {
      const price = await prisma.priceSnapshot.findFirst({
        where: {
          itemId: wi.itemId,
          timestamp: latestSnapshot.timestamp,
        },
      });

      if (price?.highPrice && price?.lowPrice) {
        instantBuy = price.lowPrice;
        instantSell = price.highPrice;
        currentMargin = calculateNetMargin(price.lowPrice, price.highPrice);
        currentRoi = Math.round(calculateROI(price.lowPrice, price.highPrice) * 100) / 100;

        // Check if alert thresholds are met
        const marginOk = !wi.minMargin || currentMargin >= wi.minMargin;
        const roiOk = !wi.minRoi || currentRoi >= wi.minRoi;
        const priceOk = !wi.maxBuyPrice || price.lowPrice <= wi.maxBuyPrice;
        isTriggered = marginOk && roiOk && priceOk;
      }
    }

    result.push({
      id: wi.id,
      itemId: wi.itemId,
      itemName: wi.item.name,
      minMargin: wi.minMargin,
      minRoi: wi.minRoi,
      maxBuyPrice: wi.maxBuyPrice,
      notes: wi.notes,
      currentMargin,
      currentRoi,
      isTriggered,
      instantBuy,
      instantSell,
    });
  }

  return NextResponse.json({ data: result });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, minMargin, minRoi, maxBuyPrice, notes } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    // Verify item exists
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        itemId,
        minMargin: minMargin || null,
        minRoi: minRoi || null,
        maxBuyPrice: maxBuyPrice || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(watchlistItem, { status: 201 });
  } catch (error) {
    console.error("Watchlist create error:", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}
