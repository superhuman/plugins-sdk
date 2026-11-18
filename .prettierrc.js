module.exports = {
  trailingComma: 'all',
  printWidth: 120,
  singleQuote: true,
  bracketSpacing: false,
  arrowParens: 'avoid',
  // The monorepo release import accepts only JSON.stringify(value, null, 2) output for the plugin manifest.
  overrides: [{files: '.agents/plugin.json', options: {parser: 'json-stringify'}}],
}