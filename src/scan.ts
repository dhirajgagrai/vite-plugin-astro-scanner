import * as eslexer from "es-module-lexer";

type ConstValue<T extends string> = Record<T, string | boolean>;

function includesExport(code: string, booleanExports: Set<string>) {
    for (const name of booleanExports) {
        if (code.includes(name))
            return true;
    }
    return false;
}

let didInit = false;

export async function scan<T extends string>(
    code: string,
    id: string,
    scanArgs: T[]
): Promise<ConstValue<T> | Record<string, never>> {
    const booleanExports = new Set(scanArgs);
    if (!includesExport(code, booleanExports)) return {};

    if (!didInit) {
        await eslexer.init;
        didInit = true;
    }

    const [_, exports] = eslexer.parse(code, id);
    const pageOptions: ConstValue<T> = {} as ConstValue<T>;
    for (const _export of exports) {
        const { n: name, le: endOfLocalName } = _export;
        if (name === "prerender")
            continue;
        if (booleanExports.has(name as T)) {
            const prefix = code.slice(0, endOfLocalName).split("export").pop()?.trim().replace(name, "").trim();
            const suffix = code.slice(endOfLocalName).trim().replace(/=/, "").trim().split(/[;\n]/)[0];
            if (prefix !== "const") {
                throw new Error("Mutable export not supported.");
            } else {
                pageOptions[name as T] = suffix;
            }
        }
    }
    return pageOptions;
}
