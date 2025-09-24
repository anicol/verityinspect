module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  globals: {
    React: 'readonly',
    NodeJS: 'readonly',
    BlobPart: 'readonly',
  },
  rules: {
    'react-refresh/only-export-components': 'off', // Disable for contexts and hooks
    '@typescript-eslint/no-explicit-any': 'off', // Allow any type
    '@typescript-eslint/no-unused-vars': 'off', // Turn off to avoid conflicts
    'no-unused-vars': 'off', // Turn off since we have TypeScript
    'no-undef': 'off', // Turn off since TypeScript handles this
    'no-redeclare': 'off', // Turn off for TypeScript declaration files
  },
}