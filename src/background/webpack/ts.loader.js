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
                        "@babel/env",
                        "@babel/preset-typescript",
                        "@babel/preset-react",
                    ],
                    plugins: [
                        "@babel/proposal-class-properties",
                        "@babel/proposal-object-rest-spread",
                    ],
                },
            },
        ],
    },
];
