const renderer = {
    name: "astro:jsx",
    serverEntrypoint: "astro/jsx/server.js",
    jsxImportSource: "astro",
    jsxTransformOptions: async () => {
        const {
            default: { default: jsx }
        } = await import("@babel/plugin-transform-react-jsx");
        const { default: astroJSX } = await import("./babel");
        return {
            plugins: [
                astroJSX(),
                jsx({}, { throwIfNamespace: false, runtime: "automatic", importSource: "astro" })
            ]
        };
    }
};
const renderer_default = renderer;
export {
    renderer_default as default
};
