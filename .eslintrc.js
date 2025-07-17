module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                printWidth: 120,
                tabWidth: 2, // reformat to 2 eventually
                useTabs: false, // default
                semi: true, // default
                singleQuote: true,
                trailingComma: 'all',
                bracketSpacing: true, // default
                jsxBracketSameLine: true,
                arrowParens: 'avoid', // default
            },
        ],
        indent: ['warn', 2],
        camelcase: [0, { properties: 'never' }],
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'no-prototype-builtins': 0, // refactor and enable
        'consistent-return': 0, // refactor and enable
        'no-param-reassign': 0, // refactor and enable
        'no-unsafe-finally': 0, // refactor and enable
        'no-use-before-define': 0, // refactor and enable
        'import/no-unresolved': 0, // some linter import errors
        'no-undef': 0,
        'class-methods-use-this': 0, // refactor and enable
        'vue/max-attributes-per-line': [
            'error',
            {
                singleline: 5,
                multiline: {
                    max: 5,
                    allowFirstLine: true,
                },
            },
        ],
        'max-len': ['warn', 1000], // usage of SVG
        'no-restricted-syntax': [
            'error',
            {
                selector: 'LabeledStatement',
                message:
                    'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
                selector: 'WithStatement',
                message:
                    '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            },
        ],
    },
};
