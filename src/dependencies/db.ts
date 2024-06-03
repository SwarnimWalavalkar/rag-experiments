import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { Sql } from "postgres";
import config from "../config";

import * as users from "../schema/user";

const schema = { ...users };

export let dbConnection: Sql;
export let db: PostgresJsDatabase<typeof schema>;

export const setupDB = async () => {
  const {
    name,
    db: { user, password, host, port },
  } = config;

  dbConnection = postgres({
    user,
    password,
    host,
    port: Number(port),
    database: name,
  });

  db = drizzle(dbConnection, { schema });
};
