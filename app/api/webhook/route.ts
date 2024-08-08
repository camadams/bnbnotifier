import { processWebhookEvent, storeWebhookEvent } from "@/app/actions";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { webhookHasMeta } from "@/lib/typeguard";
import { Webhook } from "@lemonsqueezy/lemonsqueezy.js";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function POST(request: Request) {
  // if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
  console.log({ here11: "1" });
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", {
      status: 500,
    });
  }

  // First, make sure the request is from Lemon Squeezy.
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(
    request.headers.get("X-Signature") ?? "",
    "utf8"
  );

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }
  console.log({ here32: "1" });

  const data = JSON.parse(rawBody) as unknown;
  console.log({ data });

  // Type guard to check if the object has a 'meta' property.
  if (webhookHasMeta(data)) {
    const webhookEventId = await storeWebhookEvent(data.meta.event_name, data);
    console.log({ here40: 1 });
    console.log({ here40: webhookEventId });

    // Non-blocking call to process the webhook event.
    void processWebhookEvent(webhookEventId);

    return new Response("OK", { status: 200 });
  }
  console.log({ here46: 1 });

  return new Response("No webhook meta", { status: 200 });
}
