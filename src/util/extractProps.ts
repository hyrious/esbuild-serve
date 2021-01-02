export function extractProps(str: string) {
    const ret: Record<string, string> = {};
    const iter = str.matchAll(/ ([^=]+)=(?:'([^']+)'|"([^"]+)"|(\S+))/g);
    for (const a of iter) {
        const key = a[1];
        const value = a[2] || a[3] || a[4];
        if (key && value) {
            ret[key] = value;
        }
    }
    return ret;
}
