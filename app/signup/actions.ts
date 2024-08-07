"use server";

import { db } from "@/db";
import { hash } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateIdFromEntropySize } from "lucia";
import { userTable } from "@/db/schema";

export async function signUp(_: any, formData: FormData) {
  const username = formData.get("username");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      message: "Invalid username. Please enter 4 or more characters",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      message: "Invalid password. Please enter 7 or more characters.",
    };
  }

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  //   const passwordHash = await hash(password, {
  //     // recommended minimum parameters
  //     memoryCost: 19456,
  //     timeCost: 2,
  //     outputLen: 32,
  //     parallelism: 1,
  //   });
  const userId = generateIdFromEntropySize(10); // 16 characters long

  try {
    // TODO: check if username is already used
    await db
      .insert(userTable)
      .values({ id: userId, username: username, password_hash: passwordHash });
  } catch (error) {
    return {
      message: (error as Error).message + " \n\n .Refresh and try again.",
    };
  }

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/");
}
