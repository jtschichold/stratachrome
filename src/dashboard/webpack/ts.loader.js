module.exports = [
    {
        test: /\.ts[x]?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: "babel-loader",
                options: {
                    sourceMaps: true,
                    presets: [
                        ["@babel/env", { targets: { chrome: "80" } }],
                        "@babel/preset-typescript",
                        "@babel/preset-react",
                    ],
                    plugins: [
                        "@babel/proposal-class-properties",
                        "@babel/proposal-object-rest-spread",
                        "@babel/plugin-proposal-optional-chaining",
                    ],
                },
            },
        ],
    },
];
