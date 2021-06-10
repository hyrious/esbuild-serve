import type { BuildOptions } from "esbuild";
import fs from "fs";
import path from "path";

function getFolders(dir = process.cwd()) {
  const folders = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
  folders.unshift(".");
  return folders;
}

function lookupFile(filename: string, dir = process.cwd()) {
  for (const folder of getFolders(dir)) {
    const file = path.join(dir, folder, filename);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return file;
    }
  }
}

export function lookupIndexHtml(dir = process.cwd()) {
  return lookupFile("index.html", dir);
}

const possibleNames = "index|main|script|app".split("|");
export const possibleExts = "tsx|ts|jsx|mjs|js".split("|");

function lookupEntryPoint(name: string, dir = process.cwd()) {
  for (const ext of possibleExts) {
    const filename = `${name}.${ext}`;
    const file = lookupFile(filename, dir);
    if (file) return file;
  }
}

const scriptRE = /(<script\b(\s[^>]*>|>))(.*?)<\/script>/gims;
const commentRE = /<!--(.|[\r\n])*?-->/;
const srcRE = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;

function scanEntries(raw: string, dir = process.cwd()) {
  raw = raw.replace(commentRE, "");
  const src: string[] = [];
  for (let match; (match = scriptRE.exec(raw)); ) {
    const [, openTag] = match;
    const srcMatch = openTag.match(srcRE);
    if (srcMatch) {
      src.push(srcMatch[1] || srcMatch[2] || srcMatch[3]);
    }
  }
  // no <script>
  if (!src.length) {
    return {};
  }

  const entries: Record<string, string | undefined> = {};
  for (const s of src) {
    const basename = path.basename(s, path.extname(s));
    entries[s] = lookupEntryPoint(basename, dir);
  }

  // also lookup possibleNames if there's only one entry
  if (src.length === 1) {
    for (const name of possibleNames) {
      entries[src[0]] ||= lookupEntryPoint(name, dir);
    }
  }

  const result: Record<string, string> = {};

  for (const [k, v] of Object.entries(entries)) {
    if (v) {
      result[path.relative(process.cwd(), k)] = path.relative(process.cwd(), v);
    } else {
      console.warn("not found entry file for", k);
    }
  }

  return result;
}

export function searchEntries(html: string, dir = process.cwd()): BuildOptions {
  const entries = scanEntries(html, dir);
  const outfiles = Object.keys(entries);

  // don't build anything :-)
  if (outfiles.length === 0) {
    return {};
  }

  // one file: use "outfile"
  if (outfiles.length === 1) {
    return {
      entryPoints: [entries[outfiles[0]]],
      outfile: path.relative(process.cwd(), path.join(dir, outfiles[0])),
    };
  }

  // multi file: use { out1: "in1.js", out2: "in2.js" }
  const entryPoints: Record<string, string> = {};
  for (const outfile of outfiles) {
    const entry = entries[outfile];
    entryPoints[path.dirname(outfile)] = entry;
  }

  return entryPoints;
}
