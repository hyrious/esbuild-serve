export function injectClient(text: string) {
    const i = text.indexOf("<head>");
    if (i === -1) {
        return text;
    }
    const start = i + "<head>".length;
    return (
        text.substring(0, start) +
        '<script type="module" src="/__client"></script>' +
        text.substring(start)
    );
}
