import type { AstroConfig } from "astro";

const SUPPORTED_MARKDOWN_FILE_EXTENSIONS = [
    ".markdown",
    ".mdown",
    ".mkdn",
    ".mkd",
    ".mdwn",
    ".md"
];
const pageExtensions = ['.astro', '.html', ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS];

function resolvePages(config: AstroConfig) {
    return new URL("./pages", config.srcDir);
}

function isInPagesDir(file: URL, config: AstroConfig) {
    const pagesDir = resolvePages(config);
    return file.toString().startsWith(pagesDir.toString());
}

function isPublicRoute(file: URL, config: AstroConfig) {
    const pagesDir = resolvePages(config);
    const parts = file.toString().replace(pagesDir.toString(), "").split("/").slice(1);
    for (const part of parts) {
        if (part.startsWith("_"))
            return false;
    }
    return true;
}

function endsWithPageExt(file: URL,) {
    for (const ext of pageExtensions) {
        if (file.toString().endsWith(ext))
            return true;
    }
    return false;
}

export function isPage(file: URL, config: AstroConfig) {
    if (!isInPagesDir(file, config))
        return false;
    if (!isPublicRoute(file, config))
        return false;
    return endsWithPageExt(file);
}

export function isEndpoint(file: URL, config: AstroConfig) {
    if (!isInPagesDir(file, config))
        return false;
    if (!isPublicRoute(file, config))
        return false;
    return !endsWithPageExt(file);
}

export function parseExportData(suffix: string) {
    if (/^-?\d+$/.test(suffix)) {
        return parseInt(suffix);
    }
    if (suffix === "true") {
        return true;
    }
    if (suffix === "false") {
        return false;
    }
    return suffix.replace(/["']/g, "");
}
