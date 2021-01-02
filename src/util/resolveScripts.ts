import { extractProps } from "./extractProps";

export function resolveScripts(text: string) {
    const map = new Map<string, string>();
    const iter = text.matchAll(/<script([^>]+)>/g);
    for (const { 1: propsStr } of iter) {
        const props = extractProps(propsStr);
        const { src } = props;
        if (!src || src.startsWith("http://") || src.startsWith("https://")) {
            continue;
        }
        const real = props["data-src"] || src;
        map.set(src, real);
    }
    return map;
}
