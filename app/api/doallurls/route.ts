import { scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain } from "@/app/dashboard/action";
import { NextResponse } from "next/server";

export const maxDuration = 50;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  var apisecret = request.headers.get("authorization");
  if (apisecret !== process.env.API_SECRET) {
    return NextResponse.json("invalid", { status: 403 });
  }
  await scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain();
  return NextResponse.json("done", { status: 200 });
}
