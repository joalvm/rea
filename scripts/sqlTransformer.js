const expoTransformer = require("@expo/metro-config/babel-transformer");

module.exports.transform = function transform({ filename, src, options }) {
    if (filename.endsWith(".sql")) {
        return expoTransformer.transform({
            filename,
            options,
            src: `module.exports = ${JSON.stringify(src)};`,
        });
    }

    return expoTransformer.transform({ filename, src, options });
};
