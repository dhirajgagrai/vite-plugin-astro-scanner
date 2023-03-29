import { AstroConfig, AstroAdapter, InjectedRoute, ContentEntryType, AstroRenderer, InjectedScriptStage } from "astro";
import type { TsConfigJson } from 'tsconfig-resolver';
import { type Plugin as VitePlugin } from "vite";
import { normalizePath } from "vite";

import { AstroTimer } from "./timer";

import { createBaseSettings } from "./settings";

import { isEndpoint, isPage } from "./utils";
import { scan } from "./scan";

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

const constExports = (
    config: AstroConfig,
    scanArgs: string[]
): VitePlugin => {
    const settings: AstroSettings = createBaseSettings(config);
    return {
        name: "astro:const-export",
        enforce: "post",
        async transform(code, id, options) {
            if (!(options == null ? void 0 : options.ssr))
                return;

            const filename = normalizePath(id);
            let fileURL: URL;
            try {
                fileURL = new URL(`file://${filename}`);
            } catch (e) {
                // handle e
                return;
            }

            const fileIsPage = isPage(fileURL, settings);
            const fileIsEndpoint = isEndpoint(fileURL, settings);
            if (!(fileIsPage || fileIsEndpoint))
                return;

            const pageOptions = await scan(code, id, scanArgs);
            const { meta = {} } = this.getModuleInfo(id) ?? {};

            return {
                code,
                map: null,
                meta: {
                    ...meta,
                    astro: {
                        ...meta.astro ?? { hydratedComponents: [], clientOnlyComponents: [], scripts: [] },
                        pageOptions
                    }
                }
            };
        }
    };
}

export default constExports;