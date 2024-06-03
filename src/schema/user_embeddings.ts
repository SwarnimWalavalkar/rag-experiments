import {
  AnyColumn,
  InferInsertModel,
  InferSelectModel,
  SQLWrapper,
  getTableColumns,
  sql,
} from "drizzle-orm";
import {
  customType,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import config from "../config";
import { users } from "./user";

const {
  constants: { DEFAULT_EMBEDDINGS_DIMENSION },
} = config;

export const customVector = customType<{
  data: number[];
  driverData: string;
  config: { dimension: number };
}>({
  dataType(config) {
    return `vector(${config?.dimension ?? DEFAULT_EMBEDDINGS_DIMENSION})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },

  fromDriver(value) {
    return fromSql(value);
  },
});

const fromSql = (value: string) => {
  return value
    .substring(1, value.length - 1)
    .split(",")
    .map((v) => parseFloat(v));
};

export const user_embeddings = pgTable("user_embeddings", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").default(sql`REPLACE(gen_random_uuid()::text, '-', '' )`),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  url: text("url").notNull(),
  content: text("content").notNull(),

  embedding: customVector("embedding", {
    dimension: config.openai.embeddings.dimension
  }).notNull(),

  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserEmbedding = InferSelectModel<typeof user_embeddings>;
export type UserEmbeddingInsert = InferInsertModel<typeof user_embeddings>;

export type UserEmbeddingAttributes = Omit<
  UserEmbedding,
  "id" | "created_at" | "updated_at" | "user_id"
>;

export const userEmbeddingAttrPartialSelectColumns: {
  [k in keyof UserEmbeddingAttributes]: true;
} = {
  uuid: true,
  url: true,
  content: true,
  embedding: true,
} as const;

const {
  id: _id,
  created_at: _created_at,
  updated_at: _updated_at,
  ...restUserEmbeddingCols
} = getTableColumns(user_embeddings);

export const userEmbeddingAttrReturningColumns = restUserEmbeddingCols;
