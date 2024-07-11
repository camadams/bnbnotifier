"use server";

import { db } from "@/src/db";
import { signUpsTable } from "@/src/db/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

export async function addEmailForSignUp(prevState: any, formData: FormData) {
  const x = headers();
  console.log(x.get("x-real-ip"));
  try {
    const rateLimiter = new RateLimiterMemory({
      points: 10, // Number of points
      duration: 60, // Per second(s)
    });
    const ip = getIP();
    if (ip) {
      await rateLimiter.consume(ip);
      const email = formData.get("email") as string;
      await db.insert(signUpsTable).values({ email });
      revalidatePath("/");
      return {
        message: "Thanks. 😊",
      };
    }
    return {
      message: "Error: could not load your IP Address.",
    };
  } catch (error) {
    return {
      message: (error as Error).message + " \n\n Refresh and try again.",
    };
  }
}

const getIP = (): string | undefined => {
  const xForwardedFor = headers().get("x-forwarded-for");
  const xRealIp = headers().get("x-real-ip");
  return ((xForwardedFor ?? xRealIp) || "").split(",")[0].trim();
};
