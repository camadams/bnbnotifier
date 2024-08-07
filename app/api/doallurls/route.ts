import {
  scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain,
  scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap,
} from "@/app/dashboard/action";
import { db } from "@/db";
import { urlTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 60;

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
  return NextResponse.json(res);
  // return NextResponse.json({ msg: res?.msg });
}
