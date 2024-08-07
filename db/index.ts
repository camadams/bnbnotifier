// import { config } from "dotenv";
// import { drizzle } from "drizzle-orm/libsql";
// import { createClient } from "@libsql/client";
// import * as schema from "./schema";
// config({ path: ".env" });

// const client = createClient({
//   url: process.env.TURSO_CONNECTION_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN!,
// });

// export const db = drizzle(client, { schema });

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
config({ path: ".env" });

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
