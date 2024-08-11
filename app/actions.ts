"use server";
import crypto from "node:crypto";

import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validateRequest } from "@/lib/validate-request";
import { NewWebhookEvent, userTable, webhookEvents } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { webhookHasData, webhookHasMeta } from "@/lib/typeguard";

// export default async function Page() {
//   return (
//     <form action={logout}>
//       <button>Sign out</button>
//     </form>
//   );
// }

export async function logout() {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/");
}

export async function storeWebhookEvent(
  eventName: string,
  body: NewWebhookEvent["body"]
) {
  // if (!process.env.POSTGRES_URL) {
  //   throw new Error("POSTGRES_URL is not set");
  // }

  const id = crypto.randomInt(100000000, 1000000000);

  const returnedValue = await db
    .insert(webhookEvents)
    .values({
      id,
      eventName,
      processed: false,
      body,
    })
    .returning();

  return returnedValue[0];
}

/**
 * This action will process a webhook event in the database.
 */
export async function processWebhookEvent(webhookEvent: NewWebhookEvent) {
  // configureLemonSqueezy();
  const dbwebhookEvent = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, webhookEvent.id));
  if (dbwebhookEvent.length < 1) {
    throw new Error(
      `Webhook event #${webhookEvent.id} not found in the database.`
    );
  }

  // if (!process.env.WEBHOOK_URL) {
  //   throw new Error(
  //     "Missing required WEBHOOK_URL env variable. Please, set it in your .env file."
  //   );
  // }
  let processingError = "";
  const eventBody = webhookEvent.body;
  if (!webhookHasMeta(eventBody)) {
    processingError = "Event body is missing the 'meta' property.";
  } else if (webhookHasData(eventBody)) {
    /*
    if (webhookEvent.eventName.startsWith("subscription_payment_")) {
      // Save subscription invoices; eventBody is a SubscriptionInvoice
      // Not implemented.
    } else if (webhookEvent.eventName.startsWith("subscription_")) {
      // Save subscription events; obj is a Subscription
      const attributes = eventBody.data.attributes;
      const variantId = attributes.variant_id as string;

      // We assume that the Plan table is up to date.
      const plan = await db
        .select()
        .from(plans)
        .where(eq(plans.variantId, parseInt(variantId, 10)));

      if (plan.length < 1) {
        processingError = `Plan with variantId ${variantId} not found.`;
      } else {
        // Update the subscription in the database.

        const priceId = attributes.first_subscription_item.price_id;

        // Get the price data from Lemon Squeezy.
        const priceData = await getPrice(priceId);
        if (priceData.error) {
          processingError = `Failed to get the price data for the subscription ${eventBody.data.id}.`;
        }

        const isUsageBased = attributes.first_subscription_item.is_usage_based;
        const price = isUsageBased
          ? priceData.data?.data.attributes.unit_price_decimal
          : priceData.data?.data.attributes.unit_price;

        const updateData: NewSubscription = {
          lemonSqueezyId: eventBody.data.id,
          orderId: attributes.order_id as number,
          name: attributes.user_name as string,
          email: attributes.user_email as string,
          status: attributes.status as string,
          statusFormatted: attributes.status_formatted as string,
          renewsAt: attributes.renews_at as string,
          endsAt: attributes.ends_at as string,
          trialEndsAt: attributes.trial_ends_at as string,
          price: price?.toString() ?? "",
          isPaused: false,
          subscriptionItemId: attributes.first_subscription_item.id,
          isUsageBased: attributes.first_subscription_item.is_usage_based,
          userId: eventBody.meta.custom_data.user_id,
          planId: plan[0].id,
        };

        // Create/update subscription in the database.
        try {
          await db.insert(subscriptions).values(updateData).onConflictDoUpdate({
            target: subscriptions.lemonSqueezyId,
            set: updateData,
          });
        } catch (error) {
          processingError = `Failed to upsert Subscription #${updateData.lemonSqueezyId} to the database.`;
          console.error(error);
        }
      }
        */
    if (webhookEvent.eventName.startsWith("order_")) {
      const userIdFromWebhook = eventBody.meta.custom_data.userId as string;
      if (!userIdFromWebhook) {
        console.error("No userId was received from the webhook ");
        processingError += "No userId was received from the webhook ";
      }
      const user = await db.query.userTable.findFirst({
        where: eq(userTable.id, userIdFromWebhook),
      });
      if (!user) {
        const ta = `Failed to load user with id: ${userIdFromWebhook}. Received a webhook that the user paid for notification credits. Could not update this users notification count.`;
        console.error(ta);
        processingError += ta;
      } else {
        await db
          .update(userTable)
          .set({
            notifications_count: user.notifications_count + 10,
          })
          .where(eq(userTable.id, userIdFromWebhook));

        // await db.execute(
        //   sql`UPDATE user SET notifications_count = notifications_count + ${10} WHERE user_id = '${userIdFromWebhook}'`
        // );
      }
    } else if (webhookEvent.eventName.startsWith("license_")) {
    }
    const a = await db
      .update(webhookEvents)
      .set({
        processed: true,
        processingError,
      })
      .where(eq(webhookEvents.id, webhookEvent.id));
  }
}
