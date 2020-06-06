const git = require("simple-git");
const process = require("process");
const fs = require("fs");

const googleSecretsRegExs = [
    {
        pattern: /[\r\n]+(?:\w+:.+)*[\s]*(?:[0-9a-zA-Z+\/=]{64,76}[\r\n]+)+[0-9a-zA-Z+\/=]+[\r\n]+/,
        description: "Private Key",
    },
    {
        pattern: /BEGIN PRIVATE KEY/,
        description: "Private Key",
    },
    {
        pattern: /BEGIN RSA PRIVATE KEY/,
        description: "RSA Private Key",
    },
    {
        pattern: /-BEGIN EC PRIVATE KEY/,
        description: "EC Private Key",
    },
    {
        pattern: /AIza[0-9A-Za-z\-_]{35}/,
        description: "Google API Key",
    },
    {
        pattern: /[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/,
        description: "Google OAuth ID",
    },
];

git().status((err, status) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    [...status.modified, ...status.created].forEach((fname) => {
        fs.readFile(fname, "utf8", (err, data) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }

            googleSecretsRegExs.forEach((s) => {
                if (data.match(s.pattern)) {
                    console.log(
                        "ERROR - Commit blocked: " +
                            fname +
                            " contains a " +
                            s.description
                    );
                    process.exit(1);
                }
            });
        });
    });
});
