/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unused-vars": "off", 
    "@typescript-eslint/no-require-imports": "off",
    "no-unused-vars": "off"
  }
};

export default config;
