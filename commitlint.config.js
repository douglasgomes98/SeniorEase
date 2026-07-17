const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const CO_AUTHOR_REGEX = /co-authored-by/i;

/**
 * Governanca de commits (inegociavel):
 * - tipos permitidos: feat (implementacao), fix (correcao de bug), docs (README)
 * - exemplo canonico: "feat: implementacao da home do usuario"
 * - proibido: emoji, co-author, ponto final no assunto
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-emoji": ({ raw }) => [
          !EMOJI_REGEX.test(raw || ""),
          "A mensagem de commit nao pode conter emoji.",
        ],
        "no-co-author": ({ raw }) => [
          !CO_AUTHOR_REGEX.test(raw || ""),
          "A mensagem de commit nao pode citar co-author.",
        ],
      },
    },
  ],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs"]],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "no-emoji": [2, "always"],
    "no-co-author": [2, "always"],
  },
};
