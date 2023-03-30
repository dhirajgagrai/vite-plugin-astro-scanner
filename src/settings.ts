import type {
    AstroConfig,
    AstroAdapter,
    InjectedRoute,
    ContentEntryType,
    AstroRenderer,
    InjectedScriptStage
} from "astro";
import type { TsConfigJson } from "tsconfig-resolver";
import jsxRenderer from "astro/dist/jsx/renderer";

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

export interface AstroSettings {
    config: AstroConfig;
    adapter: AstroAdapter | undefined;
    injectedRoutes: InjectedRoute[];
    pageExtensions: string[];
    contentEntryTypes: ContentEntryType[];
    renderers: AstroRenderer[];
    scripts: {
        stage: InjectedScriptStage;
        content: string;
    }[];
    tsConfig: TsConfigJson | undefined;
    tsConfigPath: string | undefined;
    watchFiles: string[];
    forceDisableTelemetry: boolean;
    timer: AstroTimer;
}

export function createBaseSettings(config: AstroConfig): AstroSettings {
    return {
        config,
        tsConfig: undefined,
        tsConfigPath: undefined,

        adapter: undefined,
        injectedRoutes:
            config.experimental.assets && config.output === 'server'
                ? [{ pattern: '/_image', entryPoint: 'astro/assets/image-endpoint' }]
                : [],
        pageExtensions: ['.astro', '.html', ...SUPPORTED_MARKDOWN_FILE_EXTENSIONS],
        contentEntryTypes: [markdownContentEntryType],
        renderers: [jsxRenderer],
        scripts: [],
        watchFiles: [],
        forceDisableTelemetry: false,
        timer: new AstroTimer(),
    };
}
