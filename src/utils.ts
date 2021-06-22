import type { BuildOptions } from "esbuild";
import fs from "fs";
import { IncomingMessage } from "http";
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
const externalRE = /^(?:https?|ftp):\/\//i;

function scanEntries(raw: string, servedir = process.cwd()) {
  raw = raw.replace(commentRE, "");
  let src: string[] = [];
  for (let match; (match = scriptRE.exec(raw)); ) {
    const [, openTag] = match;
    const srcMatch = openTag.match(srcRE);
    if (srcMatch) {
      let s = srcMatch[1] || srcMatch[2] || srcMatch[3];
      if (externalRE.test(s)) continue;
      s = (s.startsWith("/") ? "." : "") + s;
      const t = path.join(servedir, s);
      if (fs.existsSync(t) && fs.statSync(t).isFile()) continue;
      src.push(s);
    }
  }
  // no <script>
  if (!src.length) {
    return {};
  }

  const cwd = process.cwd();
  const scanDirs = [servedir];
  if (servedir !== cwd) scanDirs.push(cwd);

  const result: Record<string, string> = {};
  for (const dir of scanDirs) {
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

    for (const [k, v] of Object.entries(entries)) {
      if (v && !(k in result)) result[k] = v;
    }
  }

  const relativeResult: Record<string, string> = {};
  for (const [k, v] of Object.entries(result)) {
    relativeResult[path.relative(process.cwd(), k)] = path.relative(process.cwd(), v);
  }

  return relativeResult;
}

export function searchEntries(html: string, servedir = process.cwd()): BuildOptions {
  const entries = scanEntries(html, servedir);
  const outfiles = Object.keys(entries);

  // don't build anything :-)
  if (outfiles.length === 0) {
    return {};
  }

  // one file: use "outfile"
  if (outfiles.length === 1) {
    return {
      entryPoints: [entries[outfiles[0]]],
      outfile: path.relative(process.cwd(), path.join(servedir, outfiles[0])),
    };
  }

  // multi file: use { out1: "in1.js", out2: "in2.js" }
  const entryPoints: Record<string, string> = {};
  for (const outfile of outfiles) {
    const entry = entries[outfile];
    const outdir = path.relative(process.cwd(), path.dirname(path.join(servedir, outfile)));
    entryPoints[outdir] = entry;
  }

  return entryPoints;
}

export function text(res: IncomingMessage) {
  return new Promise<string>((resolve) => {
    const chunks: Buffer[] = [];
    res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
