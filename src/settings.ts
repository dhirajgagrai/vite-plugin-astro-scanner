import jsxRenderer from "./renderer";
import { markdownContentEntryType } from "./content-entry-type";
import { AstroTimer } from "./timer";

const SUPPORTED_MARKDOWN_FILE_EXTENSIONS = [
    ".markdown",
    ".mdown",
    ".mkdn",
    ".mkd",
    ".mdwn",
    ".md"
];

export const createBaseSettings = (config) => {
    return {
        config,
        tsConfig: void 0,
        tsConfigPath: void 0,
        adapter: void 0,
        injectedRoutes: config.experimental.assets && config.output === "server" ? [{ pattern: "/_image", entryPoint: "astro/assets/image-endpoint" }] : [],
        pageExtensions: [".astro", ".html", ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS],
        contentEntryTypes: [markdownContentEntryType],
        renderers: [jsxRenderer],
        scripts: [],
        watchFiles: [],
        forceDisableTelemetry: false,
        timer: new AstroTimer()
    };
}