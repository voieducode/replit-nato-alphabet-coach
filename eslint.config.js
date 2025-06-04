// @ts-check
import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier';

export default antfu(
  {
    // Enable TypeScript support
    typescript: true,

    // Enable React support
    react: true,

    // Enable testing support (vitest, jest, etc.)
    test: true,

    // Use single quotes instead of double quotes
    stylistic: {
      quotes: 'single',
    },

    // Customize rules
    rules: {
      // Enforce consistent curly brace style
      curly: ['error', 'all'],

      // Restrict specific imports
      'no-restricted-imports': [
        'error',
        {
          paths: [],
        },
      ],

      // Use const for variables that are never reassigned
      'prefer-const': 'error',

      // Enforce consistent spacing in comments
      'spaced-comment': ['error', 'always'],

      // Enforces to include a complete comparison
      yoda: 'error',

      // Turn off rules that are too strict for this codebase
      'style/max-statements-per-line': 'off',
      'no-console': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      'react/no-array-index-key': 'warn',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unstable-context-value': 'warn',
      'react-refresh/only-export-components': 'warn',
      'node/prefer-global/process': 'warn',
      'ts/no-require-imports': 'warn',
      'ts/no-use-before-define': 'warn',
      'antfu/consistent-chaining': [
        'warn',
        { allowLeadingPropertyAccess: true },
      ],
    },

    // Ignore certain files
    ignores: [
      'dist',
      '.gitignore',
      'node_modules',
      '**/node_modules/**',
      'server/public',
    ],
  },
  // Add prettier config last to turn off conflicting rules
  prettier
);
