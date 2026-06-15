const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  prettierConfig,
  {
    ignores: ['dist/*'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
]);
