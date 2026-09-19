import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import type { StorybookConfig } from '@storybook/react-vite';

export default {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
  ],
  viteFinal: (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), tailwindcss()],
    resolve: {
      ...config.resolve,
      alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
    },
  }),
} satisfies StorybookConfig;
