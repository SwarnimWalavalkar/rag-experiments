import { WebpageScrapeError } from ".";
import { browser } from "../../../dependencies/browser";
import { Err, Ok, Result } from "../../../shared/result";
import logger from "../../../utils/logger";
import sleep from "../../../utils/sleep";
import { removeUnwantedTagsFromPage } from "./utils";

/**@TODO This does not work very well most of the time... */
export const linkedinScraper = async (
  url: string
): Promise<Result<string, WebpageScrapeError>> => {
  try {
    const page = await browser.newPage();

    await page.goto(url);

    await page.setViewport({ width: 1080, height: 1024 });

    await sleep(4000);

    await page.screenshot({ path: "linkedin.png" });

    let maxAttempts = 5;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        await page.waitForSelector(
          "#public_profile_contextual-sign-in > div > section > button",
          { timeout: 5000 }
        );
        await page.click(
          "#public_profile_contextual-sign-in > div > section > button"
        );
        break;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          return Err(new WebpageScrapeError("Unable to scrape linkedin page"));
        }

        await page.reload();

        await sleep(2000);
      }
    }

    await removeUnwantedTagsFromPage(page);

    const pageHTML = await page.content();

    return Ok(pageHTML);
  } catch (error) {
    logger.error(error, `[Web Scraper Service] Error scraping webpage`);
    throw error;
  }
};
