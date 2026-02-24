import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const watchlistId = parseInt(id, 10);

  if (isNaN(watchlistId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.watchlistItem.delete({ where: { id: watchlistId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const watchlistId = parseInt(id, 10);

  if (isNaN(watchlistId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { minMargin, minRoi, maxBuyPrice, notes } = body;

    const updated = await prisma.watchlistItem.update({
      where: { id: watchlistId },
      data: {
        minMargin: minMargin !== undefined ? minMargin : undefined,
        minRoi: minRoi !== undefined ? minRoi : undefined,
        maxBuyPrice: maxBuyPrice !== undefined ? maxBuyPrice : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}
