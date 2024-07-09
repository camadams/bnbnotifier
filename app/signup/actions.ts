"use server";

import { db } from "@/src/db";
import { signUpsTable } from "@/src/db/schema";
import { revalidatePath } from "next/cache";

export async function addEmailForSignUp(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    await db.insert(signUpsTable).values({ email });
    revalidatePath("/");
  } catch (error) {
    return {
      message: (error as Error).message + " \n\n Refresh and try again.",
    };
  }
}
