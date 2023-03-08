module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  settings: {

  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    'react'
  ],
  rules: {
    'object-curly-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never']
  }
}
