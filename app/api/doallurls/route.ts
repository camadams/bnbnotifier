import { scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain } from "@/app/dashboard/action";
import { NextResponse } from "next/server";

export const maxDuration = 50;
export const dynamic = "force-dynamic";

export async function GET() {
  await scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain();
  return NextResponse.json("done", { status: 200 });
}
