import {
    getConfigTemplate,
    getCustomTsLoaderOptions,
    getOutput,
    getResolveFallback,
} from "./webpack.helper.mjs";

const entries = {
    main: "./src/index.ts", // First entry point
};

export default [
    getConfigTemplate({
        module: {
            rules: [
                getCustomTsLoaderOptions({ configFile: "tsconfig.esm.json" }),
            ],
        },
        entry: entries,
        output: getOutput({ type: "umd" }),
        resolve: getResolveFallback(),
    }),
    getConfigTemplate({
        module: {
            rules: [
                getCustomTsLoaderOptions({ configFile: "tsconfig.cjs.json" }),
            ],
        },
        entry: entries,
        target: "node",
        externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
        output: getOutput({ type: "commonjs2", name: "commonjs2" }),
    }),
    getConfigTemplate({
        module: {
            rules: [
                getCustomTsLoaderOptions({ configFile: "tsconfig.cjs.json" }),
            ],
        },
        entry: entries,
        target: "node",
        externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
        output: getOutput({ type: "commonjs", name: "commonjs" }),
    }),
];
