module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2021: true, 
    node: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module' 
  },
  settings: { 
    react: { 
      version: 'detect' 
    } 
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'max-len': ['warn', { code: 100, ignoreStrings: true }],
    'react-hooks/exhaustive-deps': 'warn'
  }
};
