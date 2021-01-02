import { dirname } from "path";

export function resolveDirname(pathname: string) {
    return pathname.endsWith("/") ? pathname : dirname(pathname);
}
