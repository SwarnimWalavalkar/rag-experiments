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
