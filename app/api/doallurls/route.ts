import { scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain } from "@/app/dashboard/action";
import { NextResponse } from "next/server";

export const maxDuration = 50;
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain();
  return NextResponse.json(res, { status: 200 });
  // return NextResponse.json({ msg: res?.msg });
}
