import { WebpageScrapeError, removeUnwantedTagsFromPage } from ".";
import { browser } from "../../../dependencies/browser";
import { Ok, Result } from "../../../shared/result";
import logger from "../../../utils/logger";
import sleep from "../../../utils/sleep";

export const linkedinScraper = async (
  url: string
): Promise<Result<string, WebpageScrapeError>> => {
  try {
    const page = await browser.newPage();

    await page.goto(url);

    await page.setViewport({ width: 1080, height: 1024 });

    await sleep(4000);

    await page.screenshot({ path: "linkedin.png" });

    await page.click(
      "#public_profile_contextual-sign-in > div > section > button"
    );

    await removeUnwantedTagsFromPage(page);

    const pageHTML = await page.content();

    return Ok(pageHTML);
  } catch (error) {
    logger.error(error, `[Web Scraper Service] Error scraping webpage`);
    throw error;
  }
};
