import globals from "globals";
// import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // 규칙 추가
      "no-console": "warn", // 콘솔 로그 사용에 대해 경고
      // indent: ["error", 2], // 들여쓰기를 2칸으로 설정
      // quotes: ["error", "double"], // 문자열 쌍따옴표
      // "no-unused-vars": "warn",
      // "no-undef": "warn",
      "prefer-const": ["warn", { ignoreReadBeforeAssign: true }],
    },
  },
  // pluginJs.configs.recommended,
];
