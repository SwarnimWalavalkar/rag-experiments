import z from "zod";
import hermes from "..";
import { scrapeWebpage } from "../../app/services/webscraper";
import { summarizeWebpageContent } from "../../app/services/ai/groq.service";
import { HTMLToMarkdown } from "../../app/services/webscraper/webpageToMarkdown";
import { createUserEmbedding } from "../../app/services/user_embeddings/user_embeddings.service";
import logger from "../../utils/logger";
import { IEvent } from "../../packages/hermes";
import { openAIEmbedText } from "../../app/services/ai/openai.embeddings.service";

const messagePayloadSchema = z.object({
  url: z.string(),
  user_id: z.number(),
});

export let queueWebpageScrape: IEvent<z.infer<typeof messagePayloadSchema>>;

hermes
  .registerEvent("webpage-scrape-queue", messagePayloadSchema, {
    maxRetries: 3,
  })
  .then((event) => {
    queueWebpageScrape = event;
  });

export function registerWebpageScrapeQueueHandler() {
  queueWebpageScrape.subscribe(async ({ data, msg }) => {
    logger.info(`URL queued to scrape: ${data.url}`);

    logger.info(`MSG_MAX_RETRIES: ${msg.maxRetries}`);
    logger.info(`MSG_RETRY_COUNT: ${msg.retryCount}`);

    const crawlWebpageResult = await scrapeWebpage(data.url);

    if (!crawlWebpageResult.ok) {
      throw crawlWebpageResult.error;
    }

    logger.info("CRAWL_WEBPAGE_OK");

    const HTMLToMarkdownResult = await HTMLToMarkdown(crawlWebpageResult.value);

    if (!HTMLToMarkdownResult.ok) {
      throw HTMLToMarkdownResult.error;
    }

    logger.info("HTML_TO_MD_OK");

    const summarizedContent = await summarizeWebpageContent(
      HTMLToMarkdownResult.value,
      { model: "mixtral-8x7b-32768" }
    );

    if (!summarizedContent.ok) {
      throw summarizedContent.error;
    }

    logger.info("SUMMARIZATION_OK");

    const summaryEmbedding = await openAIEmbedText(summarizedContent.value);

    if (!summaryEmbedding.ok) {
      throw summaryEmbedding.error;
    }

    logger.info("SUMMARY_EMBEDDINGS_OK");

    const embeddingWriteResult = await createUserEmbedding({
      user_id: data.user_id,
      embedding: summaryEmbedding.value,
      content: summarizedContent.value,
      url: data.url,
    });

    if (!embeddingWriteResult.ok) {
      throw embeddingWriteResult.error;
    }

    logger.info(`===SUCCESSFULLY INGESTED WEBPAGE===`);

    await msg.ack();
  });
}
