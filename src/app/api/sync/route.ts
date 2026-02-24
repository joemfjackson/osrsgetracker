import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchMapping, fetchLatestPrices, fetch5mPrices } from "@/lib/osrs-api";

export async function POST() {
  try {
    // Fetch mapping, latest prices, and 5m volume data in parallel
    const [mapping, latest, fiveMin] = await Promise.all([
      fetchMapping(),
      fetchLatestPrices(),
      fetch5mPrices(),
    ]);

    // Upsert all items from mapping
    const now = new Date();
    let itemCount = 0;
    let priceCount = 0;

    // Batch upsert items
    for (const item of mapping) {
      await prisma.item.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          name: item.name,
          examine: item.examine || null,
          members: item.members,
          highalch: item.highalch || null,
          geLimit: item.limit || null,
          icon: item.icon || null,
        },
        update: {
          name: item.name,
          examine: item.examine || null,
          members: item.members,
          highalch: item.highalch || null,
          geLimit: item.limit || null,
          icon: item.icon || null,
        },
      });
      itemCount++;
    }

    // Store price snapshots with volume data from /5m endpoint
    const priceEntries: Array<{
      itemId: number;
      timestamp: Date;
      highPrice: number | null;
      lowPrice: number | null;
      highVolume: number | null;
      lowVolume: number | null;
    }> = [];

    for (const [idStr, priceData] of Object.entries(latest.data)) {
      const itemId = parseInt(idStr, 10);
      if (priceData.high !== null || priceData.low !== null) {
        const volumeData = fiveMin.data[idStr];
        priceEntries.push({
          itemId,
          timestamp: now,
          highPrice: priceData.high,
          lowPrice: priceData.low,
          highVolume: volumeData?.highPriceVolume ?? null,
          lowVolume: volumeData?.lowPriceVolume ?? null,
        });
      }
    }

    // Batch create price snapshots (skip duplicates)
    for (const entry of priceEntries) {
      try {
        await prisma.priceSnapshot.create({ data: entry });
        priceCount++;
      } catch {
        // Skip duplicate timestamps
      }
    }

    // Clean up snapshots older than 7 days
    const cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const cleaned = await prisma.priceSnapshot.deleteMany({
      where: { timestamp: { lt: cutoffDate } },
    });

    return NextResponse.json({
      success: true,
      items: itemCount,
      prices: priceCount,
      cleaned: cleaned.count,
      syncedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to sync data from OSRS Wiki", details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check last sync time
  const lastSnapshot = await prisma.priceSnapshot.findFirst({
    orderBy: { timestamp: "desc" },
    select: { timestamp: true },
  });

  const itemCount = await prisma.item.count();

  return NextResponse.json({
    lastSync: lastSnapshot?.timestamp || null,
    itemCount,
  });
}
