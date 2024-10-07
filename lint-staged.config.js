module.exports = {
    // This will lint and format TypeScript and                                             //JavaScript files
    "**/*.(ts|tsx|js|jsx)": filenames => [
        `pnpm exec eslint --fix ${filenames.join(" ")}`,
        `pnpm exec prettier --write ${filenames.join(" ")}`,
    ],

    // this will Format MarkDown and JSON
    "**/*.(md|json)": filenames =>
        `pnpm exec prettier --write ${filenames.join(" ")}`,
};
