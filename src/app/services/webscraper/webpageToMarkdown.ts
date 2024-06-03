import { ServiceError } from "../../../shared/errors";
import { Err, Ok, Result } from "../../../shared/result";
import { Readability } from "@mozilla/readability";
import logger from "../../../utils/logger";
// @ts-expect-error
import { gfm } from "turndown-plugin-gfm";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";

class WebpageIngestError extends ServiceError {
  constructor(message: string, source?: string) {
    super("Embeddings Service Error", message, source);
    this.name = this.constructor.name;
  }
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

turndownService.use(gfm);

turndownService.addRule("fenceAllPreformattedText", {
  filter: ["pre"],

  replacement: function (content, node) {
    const ext = getExt(node);

    const code = [...node.childNodes].map((c) => c.textContent).join("");

    return `\n\`\`\`${ext}\n${code}\n\`\`\`\n\n`;
  },
});

turndownService.addRule("strikethrough", {
  filter: ["del", "s"],

  replacement: function (content) {
    return "~" + content + "~";
  },
});

const getExt = (node: any) => {
  // Simple match where the <pre> has the `highlight-source-js` tags
  const getFirstTag = (node: Element) =>
    node.outerHTML.split(">").shift()! + ">";

  const match = node.outerHTML.match(/(highlight-source-|language-)[a-z]+/);

  if (match) return match[0].split("-").pop();

  // Check the parent just in case
  const parent = getFirstTag(node.parentNode!).match(
    /(highlight-source-|language-)[a-z]+/
  );

  if (parent) return parent[0].split("-").pop();

  const getInnerTag = (node: Element) =>
    node.innerHTML.split(">").shift()! + ">";

  const inner = getInnerTag(node).match(/(highlight-source-|language-)[a-z]+/);

  if (inner) return inner[0].split("-").pop();

  // Nothing was found...
  return "";
};

export const HTMLToMarkdown = async (
  pageHTML: string
): Promise<Result<string, WebpageIngestError>> => {
  try {
    const dom = new JSDOM(pageHTML);
    const article = new Readability(dom.window.document, {
      keepClasses: true,
      debug: false,
      charThreshold: 100,
    }).parse();

    if (!article) {
      return Err(new WebpageIngestError("Failed to parse article"));
    }

    article.content = article.content.replace(/(\<!--.*?\-->)/g, "");

    // Try to add proper h1 if title is missing
    if (article.title.length > 0) {
      // check if first h2 is the same as title
      const h2Regex = /<h2[^>]*>(.*?)<\/h2>/;
      const match = article.content.match(h2Regex);
      if (match?.[0].includes(article.title)) {
        // replace fist h2 with h1
        article.content = article.content
          .replace("<h2", "<h1")
          .replace("</h2", "</h1");
      } else {
        // add title as h1
        article.content = `<h1>${article.title}</h1>\n${article.content}`;
      }
    }
    // contert to markdown
    let res = turndownService.turndown(article.content);

    // replace weird header refs
    const pattern = /\[\]\(#[^)]*\)/g;
    res = res.replace(pattern, "");

    return Ok(res);
  } catch (error) {
    logger.error("[Webpage to Markdown Service] Error parsing html", error);
    throw error;
  }
};
