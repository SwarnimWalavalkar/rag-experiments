import { ServiceError } from "../../../shared/errors";
import { Result } from "../../../shared/result";
import logger from "../../../utils/logger";
import { genericScraper } from "./generic.scraper";
import { linkedinScraper } from "./linkedin.scraper";

export class WebpageScrapeError extends ServiceError {
  constructor(message: string, source?: string) {
    super("Webpage scrape error", message, source);
    this.name = this.constructor.name;
  }
}

export const removeUnwantedTagsFromPage = async (page: any) => {
  await page.evaluate(() => {
    const unwantedTags = [
      "script",
      "style",
      "img",
      "video",
      "audio",
      "source",
      "track",
      "iframe",
      "object",
      "embed",
      "picture",
    ];
    unwantedTags.forEach((tag) => {
      const elements = document.getElementsByTagName(tag);
      for (const element of elements) {
        if (element && element.parentNode)
          element.parentNode.removeChild(element);
      }
    });
  });
};

export const scrapeWebpage = async (
  url: string
): Promise<Result<string, WebpageScrapeError>> => {
  try {
    switch (true) {
      case url.includes("linkedin.com"):
        return await linkedinScraper(url);
      default:
        return await genericScraper(url);
    }
  } catch (error) {
    logger.error(error, `[Web Scraper Service] Error scraping webpage`);
    throw error;
  }
};
