declare module "*.md" {
  const content: string;
  export default content;
}

declare module "https://cdn.jsdelivr.net/npm/remarkable@2.0.1/dist/esm/index.browser.js" {
  export * from "remarkable";
}

declare module "https://cdn.jsdelivr.net/npm/shiki@0.9.3/dist/index.browser.mjs" {
  export * from "shiki";
}
