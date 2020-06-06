const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HmtlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, options) => {
    return {
        entry: {
            dashboard: ["./app/dashboard.tsx"],
        },
        stats: "minimal",
        devtool: "inline-cheap-source-map",
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".scss"],
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
            rules: [
                ...require("./webpack/css.loader"),
                ...require("./webpack/ts.loader"),
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "styles/dashboard.[contenthash].css",
            }),
            new HmtlWebpackPlugin({
                template: "template/dashboard.html",
                filename: "dashboard.html",
            }),
        ],
    };
};
