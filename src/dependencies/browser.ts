import puppeteer, { Browser } from "puppeteer-core";
import config from "../config";

export let browser: Browser;

export const setupBrowser = async () => {
  const {
    chromium: { host, port, token },
  } = config;

  browser = await puppeteer.connect({
    browserWSEndpoint: `ws://${host}:${port}?token=${token}`,
  });
};
