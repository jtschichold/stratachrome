const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = [
    {
        test: /\.([s]?css)$/,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
            },
            {
                loader: "css-loader", // translates CSS into CommonJS modules
            },
            {
                loader: "postcss-loader", // Run postcss actions
                options: {
                    plugins: function () {
                        // postcss plugins, can be exported to postcss.config.js
                        return [require("autoprefixer")];
                    },
                },
            },
            {
                loader: "sass-loader", // compiles Sass to CSS
            },
        ],
    },
    {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: {
            loader: "url-loader",
            options: {
                limit: 100000,
                name: "[name].[ext]",
            },
        },
    },
];
