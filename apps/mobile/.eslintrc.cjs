const preset = require("@senior-ease/config/eslint-preset.cjs");

module.exports = {
  ...preset,
  globals: {
    ...(preset.globals || {}),
    __DEV__: "readonly",
  },
  ignorePatterns: [
    ...(preset.ignorePatterns || []),
    "android/",
    "ios/",
    ".expo/",
  ],
};
