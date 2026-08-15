// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

// Outermost first; imports flow only downward.
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

const SLICED = ['pages', 'widgets', 'features', 'entities'];

// Page components stay direct entries so lazy chunks retain meaningful names.
const PUBLIC_ENTRY = {
  pages: '*-page.ts',
  widgets: 'index.ts',
  features: 'index.ts',
  entities: 'index.ts',
};

const below = (layer) => LAYERS.slice(LAYERS.indexOf(layer) + 1);

module.exports = defineConfig([
  { ignores: ['android/**', 'ios/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      // Boundaries needs TypeScript resolution to classify relative imports and aliases.
      'import/resolver': {
        typescript: { project: 'tsconfig.app.json' },
      },
      'boundaries/dependency-nodes': ['import', 'dynamic-import'],
      'boundaries/elements': [
        // First match wins; keep the broad app pattern last.
        ...SLICED.map((layer) => ({
          type: layer,
          pattern: `src/${layer}/*`,
          capture: ['slice'],
        })),
        { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
        { type: 'app', pattern: 'src/app/**', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            ...LAYERS.flatMap((layer) => {
              const targets = below(layer);
              if (!targets.length) return [];
              const sliced = targets.filter((t) => SLICED.includes(t));
              const flat = targets.filter((t) => !SLICED.includes(t));

              return [
                ...sliced.map((target) => ({
                  from: { element: { type: layer } },
                  allow: {
                    to: {
                      element: { type: target, fileInternalPath: PUBLIC_ENTRY[target] },
                    },
                  },
                })),
                // Shared segments intentionally expose files directly.
                ...(flat.length
                  ? [
                      {
                        from: { element: { type: layer } },
                        allow: { to: { element: { types: { anyOf: flat } } } },
                      },
                    ]
                  : []),
              ];
            }),

            ...SLICED.map((layer) => ({
              from: { element: { type: layer, captured: { slice: '{{slice}}' } } },
              allow: {
                to: { element: { type: layer, captured: { slice: '{{from.captured.slice}}' } } },
              },
            })),

            {
              from: { element: { type: 'shared', captured: { segment: '{{segment}}' } } },
              allow: {
                to: {
                  element: { type: 'shared', captured: { segment: '{{from.captured.segment}}' } },
                },
              },
            },

            { from: { element: { type: 'app' } }, allow: { to: { element: { type: 'app' } } } },
          ],
        },
      ],
    },
  },
]);
