import app from "../app";
import hermes from "../hermes";
import { dbConnection } from "../dependencies/db";
import { redis } from "../dependencies/redis";
import { browser } from "../dependencies/browser";

export default async function teardown() {
  await app.close();

  await browser.close();

  await hermes.disconnect();

  await dbConnection.end();
  await redis.quit();
}
