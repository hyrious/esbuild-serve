import { Remarkable } from "https://cdn.jsdelivr.net/npm/remarkable@2.0.1/dist/esm/index.browser.js";
import * as shiki from "https://cdn.jsdelivr.net/npm/shiki@0.9.3/dist/index.browser.mjs";
import text from "../README.md";
const ce = document.createElement.bind(document);
const h = (tag: string, attr = {}) => Object.assign(ce(tag), attr);

document.title = "esbuild-serve";

document.head.append(
  h("link", {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/gh/hyrious/github-markdown-css@main/github-markdown.css",
  })
);

document.body.classList.add("markdown-body");
document.body.style.cssText = `
  max-width: 42em;
  margin: 0 auto;
  padding: .5em;
`;

(async () => {
  shiki.setCDN("https://cdn.jsdelivr.net/npm/shiki@0.9.3/");

  const highlighter = await shiki.getHighlighter({
    theme: "github-dark",
    langs: ["javascript", "typescript", "shellscript"],
  });

  const md = new Remarkable("full", {
    html: true,
    typographer: true,
    highlight(str, lang) {
      try {
        let html = highlighter.codeToHtml(str, lang);
        html = html.replace(/^<pre class="shiki".*<code>/, "");
        html = html.replace(/<\/code><\/pre>$/, "");
        return html;
      } catch {
        return "";
      }
    },
  });

  document.querySelector("#app")!.innerHTML = md.render(text);
})();
