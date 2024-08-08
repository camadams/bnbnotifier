import { scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain } from "@/app/dashboard/action";
import { NextResponse } from "next/server";

export const maxDuration = 50;
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain();
  //   const oneHourAgo = sql`datetime('now', '-1 hour')`;
  //   const unprocessedUrls = await db
  //     .select()
  //     .from(urlTable)
  //     .where(
  //       or(
  //         sql`${urlTable.lastScraped} < ${oneHourAgo}`,
  //         eq(urlTable.processed, false)
  //       )
  //     );

  //  await db.query.urlTable.findMany({ where: eq(urlTable.lastScraped, 12) });
  return NextResponse.json(res, { status: 200 });
  // return NextResponse.json({ msg: res?.msg });
}
