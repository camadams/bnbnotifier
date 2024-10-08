import { scrapUrlAndAdd } from "@/app/dashboard/action";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 50;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json(); // Parse the JSON body
  //   const { airbnbUrl, userId } = body;
  const formData = new FormData();
  const airbnbUrl = body.airbnbUrl as string;
  const userId = body.userId as string;
  formData.append("airbnbUrl", airbnbUrl);
  formData.append("userId", userId);
  const res = await scrapUrlAndAdd("", formData);
  revalidatePath("/");
  return NextResponse.json(res, { status: 200 });
}
