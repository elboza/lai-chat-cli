module.exports = {
  root: true,
  env: {
    'es6': true,
    'node': true,
  },
  parserOptions: {
      ecmaVersion: 2020,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        tabWidth: 2,
        useTabs: false, // default
        semi: true, // default
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true, // default
        jsxBracketSameLine: true,
        arrowParens: 'avoid', // default
      },
    ],
    camelcase: [0, {"properties": "never"}],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-prototype-builtins': 0, // refactor and enable
    'consistent-return': 0, // refactor and enable
    'no-param-reassign': 0, // refactor and enable
    'no-unsafe-finally': 0, // refactor and enable
    'no-use-before-define': 0, // refactor and enable
    'class-methods-use-this': 0, // refactor and enable
    'import/extensions': ['error', 'always'],
  },
};
