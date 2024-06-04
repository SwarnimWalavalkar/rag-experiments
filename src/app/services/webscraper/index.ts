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

const SCRAPER_HOSTNAMES = { LINKEDIN: "linkedin.com" } as const;

type ScraperHostnames =
  (typeof SCRAPER_HOSTNAMES)[keyof typeof SCRAPER_HOSTNAMES];

const hostnameToCrawlerMap = new Map<
  ScraperHostnames,
  (url: string) => Promise<Result<string, WebpageScrapeError>>
>([[SCRAPER_HOSTNAMES.LINKEDIN, linkedinScraper]]);

export const scrapeWebpage = async (
  url: string
): Promise<Result<string, WebpageScrapeError>> => {
  try {
    const parsedURL = new URL(url);

    let hostname = parsedURL.hostname;

    if (hostname.split(".").length > 1) {
      hostname = hostname.split(".").slice(-2).join(".");
    }

    const scraperFunc =
      hostnameToCrawlerMap.get(hostname as ScraperHostnames) ?? genericScraper;

    return await scraperFunc(url);
  } catch (error) {
    logger.error(error, `[Web Scraper Service] Error scraping webpage`);
    throw error;
  }
};
