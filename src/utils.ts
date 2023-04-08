import fs from "fs";
import path from "path";

import type { DiagnosticCode } from "@astrojs/compiler/shared/diagnostics";
import type { AstroConfig } from "astro";
import { normalizePath } from "vite";
import matter from "gray-matter";

import type { AstroSettings } from "./settings";
import { type AstroErrorCodes, AstroErrorData } from "./errors-data";

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

function endsWithPageExt(file: URL, settings: AstroSettings) {
    for (const ext of settings.pageExtensions) {
        if (file.toString().endsWith(ext))
            return true;
    }
    return false;
}

function resolveJsToTs(filePath: string) {
    if (filePath.endsWith(".jsx") && !fs.existsSync(filePath)) {
        const tryPath = filePath.slice(0, -4) + ".tsx";
        if (fs.existsSync(tryPath)) {
            return tryPath;
        }
    }
    return filePath;
}

export function isPage(file: URL, settings: AstroSettings) {
    if (!isInPagesDir(file, settings.config))
        return false;
    if (!isPublicRoute(file, settings.config))
        return false;
    return endsWithPageExt(file, settings);
}

export function isEndpoint(file: URL, settings: AstroSettings) {
    if (!isInPagesDir(file, settings.config))
        return false;
    if (!isPublicRoute(file, settings.config))
        return false;
    return !endsWithPageExt(file, settings);
}

export function parseFrontmatter(fileContents: string, filePath: string) {
    try {
        return matter(fileContents);
    } catch (e: any) {
        if (e.name === "YAMLException") {
            const err = e;
            err.id = filePath;
            err.loc = { file: e.id, line: e.mark.line + 1, column: e.mark.column };
            err.message = e.reason;
            throw err;
        } else {
            throw e;
        }
    }
}

export function resolvePath(specifier: string, importer: string) {
    if (specifier.startsWith(".")) {
        const absoluteSpecifier = path.resolve(path.dirname(importer), specifier);
        return resolveJsToTs(normalizePath(absoluteSpecifier));
    } else {
        return specifier;
    }
}

export function getErrorDataByCode(code: AstroErrorCodes | DiagnosticCode) {
    const entry = Object.entries(AstroErrorData).find((data) => data[1].code === code);
    if (entry) {
        return {
            name: entry[0],
            data: entry[1]
        };
    }
}

export function normalizeLF(code: string) {
    return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
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
