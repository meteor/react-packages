module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  settings: {},
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    'react'
  ],
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'space-before-function-paren': ['error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    '@typescript-eslint/space-before-function-paren': ['error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }],
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  }
}
