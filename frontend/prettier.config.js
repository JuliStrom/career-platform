/** @type {import('prettier').Config} */
module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
};
