import { db } from "@/db";
import { urlTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const ta = await db.query.urlTable.findFirst({
    where: eq(urlTable.processed, false),
    orderBy: [asc(urlTable.lastScraped)],
  });
  return NextResponse.json(ta);
}
