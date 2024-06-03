import type { Config } from "drizzle-kit";
import config from "./src/config";

const {
  name,
  db: { user, password, host, port },
} = config;

export default {
  schema: "./src/schema/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: { user, password, host, port, database: name },
  verbose: true,
  strict: true,
} satisfies Config;
