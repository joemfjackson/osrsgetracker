import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchTimeseries } from "@/lib/osrs-api";

const TIMEFRAME_POINTS: Record<string, number> = {
  "1h": 12,   // 12 x 5min = 1 hour
  "6h": 72,   // 72 x 5min = 6 hours
  "24h": 288, // 288 x 5min = 24 hours
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  const timeframe = request.nextUrl.searchParams.get("timeframe") || "24h";
  const maxPoints = TIMEFRAME_POINTS[timeframe] || 288;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Get latest price
  const latestPrice = await prisma.priceSnapshot.findFirst({
    where: { itemId },
    orderBy: { timestamp: "desc" },
  });

  // Fetch timeseries from OSRS Wiki API (always 5m resolution, slice to timeframe)
  let timeseries: Array<{
    timestamp: Date;
    highPrice: number | null;
    lowPrice: number | null;
  }> = [];

  try {
    const tsData = await fetchTimeseries(itemId, "5m");
    const allPoints = tsData.data.map((d) => ({
      timestamp: new Date(d.timestamp * 1000),
      highPrice: d.avgHighPrice,
      lowPrice: d.avgLowPrice,
    }));
    // Take only the last N points for the requested timeframe
    timeseries = allPoints.slice(-maxPoints);
  } catch (error) {
    console.error("Failed to fetch timeseries:", error);
  }

  return NextResponse.json({
    item,
    latestPrice: latestPrice
      ? {
          highPrice: latestPrice.highPrice,
          lowPrice: latestPrice.lowPrice,
          timestamp: latestPrice.timestamp,
        }
      : null,
    timeseries,
  });
}
