import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchMapping, fetchLatestPrices, fetch5mPrices } from "@/lib/osrs-api";
import { Prisma } from "@/generated/prisma/client";

const ITEM_BATCH_SIZE = 500;

export async function POST() {
  try {
    // Fetch mapping, latest prices, and 5m volume data in parallel
    const [mapping, latest, fiveMin] = await Promise.all([
      fetchMapping(),
      fetchLatestPrices(),
      fetch5mPrices(),
    ]);

    const now = new Date();

    // Batch upsert items via raw SQL INSERT ... ON CONFLICT
    let itemCount = 0;
    for (let i = 0; i < mapping.length; i += ITEM_BATCH_SIZE) {
      const batch = mapping.slice(i, i + ITEM_BATCH_SIZE);
      const params: (string | number | boolean | null)[] = [];
      const valueClauses: string[] = [];

      for (const item of batch) {
        const offset = params.length;
        params.push(
          item.id,
          item.name,
          item.examine || null,
          item.members,
          item.highalch || null,
          item.limit || null,
          item.icon || null,
          now.toISOString(),
        );
        valueClauses.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}::timestamptz)`
        );
      }

      await prisma.$executeRawUnsafe(
        `INSERT INTO items (id, name, examine, members, highalch, ge_limit, icon, updated_at)
         VALUES ${valueClauses.join(", ")}
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           examine = EXCLUDED.examine,
           members = EXCLUDED.members,
           highalch = EXCLUDED.highalch,
           ge_limit = EXCLUDED.ge_limit,
           icon = EXCLUDED.icon,
           updated_at = EXCLUDED.updated_at`,
        ...params,
      );
      itemCount += batch.length;
    }

    // Build price snapshot entries (only for items that exist in mapping)
    const itemIds = new Set(mapping.map((m) => m.id));
    const priceEntries: Prisma.PriceSnapshotCreateManyInput[] = [];
    for (const [idStr, priceData] of Object.entries(latest.data)) {
      const itemId = parseInt(idStr, 10);
      if (!itemIds.has(itemId)) continue;
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

    // Batch create all price snapshots in one query
    const created = await prisma.priceSnapshot.createMany({
      data: priceEntries,
      skipDuplicates: true,
    });

    // Clean up snapshots older than 7 days
    const cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const cleaned = await prisma.priceSnapshot.deleteMany({
      where: { timestamp: { lt: cutoffDate } },
    });

    return NextResponse.json({
      success: true,
      items: itemCount,
      prices: created.count,
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
