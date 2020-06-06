const path = require("path");

const HmtlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, options) => {
    return {
        entry: {
            background: ["./app/background.ts"],
        },
        stats: "minimal",
        devtool: "inline-cheap-module-source-map",
        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            modules: ["node_modules"],
            unsafeCache: true,
            symlinks: false,
        },
        optimization: {
            minimize: false,
        },
        output: {
            path: path.resolve(`../../dist`),
            filename: "[name].[contenthash].js",
        },
        module: {
            rules: [...require("./webpack/ts.loader")],
        },
        plugins: [
            new HmtlWebpackPlugin({
                template: "template/background.html",
                filename: "background.html",
            }),
        ],
    };
};
