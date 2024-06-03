import { afterAll, beforeAll } from "vitest";
import loaders from "../loaders";
import teardownApp from "../utils/teardown";
import resetPostgresDB from "./utils/resetPostgresDB";

beforeAll(async () => {
  await loaders();
});

afterAll(async () => {
  await teardownApp();
  await resetPostgresDB();
});
