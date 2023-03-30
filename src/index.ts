import type { AstroConfig } from "astro";
import { type Plugin as VitePlugin, normalizePath } from "vite";

import { type AstroSettings, createBaseSettings } from "./settings";
import { isEndpoint, isPage } from "./utils";
import { scan } from "./scan";

export default function astroConstPlugin(
    config: AstroConfig,
    scanArgs: string[],
): VitePlugin {
    const settings: AstroSettings = createBaseSettings(config);
    return {
        name: "astro:const-meta",
        enforce: "post",

        async transform(this, code, id, options) {
            if (!(options == null ? void 0 : options.ssr))
                return;

            const filename = normalizePath(id);
            let fileURL: URL;
            try {
                fileURL = new URL(`file://${filename}`);
            } catch (e) {
                // If we can't construct a valid URL, exit early
                return;
            }

            const fileIsPage = isPage(fileURL, settings);
            const fileIsEndpoint = isEndpoint(fileURL, settings);
            if (!(fileIsPage || fileIsEndpoint)) return;
            const pluginPageOptions = await scan(code, id, scanArgs);

            const { meta = {} } = this.getModuleInfo(id) ?? {};
            return {
                code,
                map: null,
                meta: {
                    ...meta,
                    astro: {
                        ...meta.astro ?? { hydratedComponents: [], clientOnlyComponents: [], scripts: [] },
                        pageOptions: {
                            ...meta.astro.pageOptions,
                            ...pluginPageOptions
                        }
                    },
                },
            };
        },
    };
}
