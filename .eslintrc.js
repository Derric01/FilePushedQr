module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
