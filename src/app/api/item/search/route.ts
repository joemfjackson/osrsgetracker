import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const items = await prisma.item.findMany({
    where: {
      name: {
        contains: q,
      },
    },
    select: {
      id: true,
      name: true,
      members: true,
      geLimit: true,
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ results: items });
}
