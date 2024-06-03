import { WebpageScrapeError, removeUnwantedTagsFromPage } from ".";
import { browser } from "../../../dependencies/browser";
import { Ok, Result } from "../../../shared/result";
import logger from "../../../utils/logger";

export const genericScraper = async (
  url: string
): Promise<Result<string, WebpageScrapeError>> => {
  try {
    const page = await browser.newPage();

    await page.goto(url);

    await removeUnwantedTagsFromPage(page);

    const pageHTML = await page.content();

    return Ok(pageHTML);
  } catch (error) {
    logger.error(error, `[Web Scraper Service] Error scraping webpage`);
    throw error;
  }
};
