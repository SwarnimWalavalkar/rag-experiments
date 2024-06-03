import hermes from "../hermes";
import { registerSubscriptions } from "../hermes/events";
import { setupDB } from "../dependencies/db";
import { setupRedis } from "../dependencies/redis";
import { setupBrowser } from "../dependencies/browser";
import sleep from "../utils/sleep";
import { setupBGEModel } from "../app/services/ai/bge.embeddings.service";

export default async function loaders() {
  let retries = 1;
  while (retries <= 5) {
    try {
      await setupRedis();
      await setupDB();
      await setupBrowser();
      // await setupBGEModel();

      await hermes.connect();
      registerSubscriptions();

      break;
    } catch (error) {
      await sleep(5000);
      retries++;
      if (retries >= 5) {
        throw error;
      }
    }
  }
}
