module.exports = {
    env: {
        browser: true,
        es6: true,
    },

    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: [
        'eslint-plugin-prefer-arrow',
        'eslint-plugin-import',
        'eslint-plugin-jsdoc',
        '@typescript-eslint',
    ],
    rules: {
        // allows to not declare return type
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        // allows to use ! assertions
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
    },
};
