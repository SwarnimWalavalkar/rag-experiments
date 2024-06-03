import { registerWebpageScrapeQueueHandler } from "./queueWebpageScrape";

export function registerSubscriptions() {
  registerWebpageScrapeQueueHandler();
}
