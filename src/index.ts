import path from "node:path";
import type { AstroConfig } from "astro";
import { type Plugin as VitePlugin } from "vite";

import { isEndpoint, isPage } from "./utils";
import { scan } from "./scan";

export default function astroConstScannerPlugin(
    config: AstroConfig,
    scanArgs: string[],
): VitePlugin {
    return {
        name: "vite-plugin-astro-const-scanner",
        enforce: "post",

        async transform(this, code, id, options) {
            if (!(options == null ? void 0 : options.ssr))
                return;

            const filename = path.normalize(id);
            let fileURL: URL;
            try {
                fileURL = new URL(`file://${filename}`);
            } catch (e) {
                // If we can't construct a valid URL, exit early
                return;
            }

            const fileIsPage = isPage(fileURL, config);
            const fileIsEndpoint = isEndpoint(fileURL, config);
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
