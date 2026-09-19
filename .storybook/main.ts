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
    // Pre-bundled so a first visit does not re-optimize and reload mid-render.
    optimizeDeps: {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        '@base-ui/react/alert-dialog', '@base-ui/react/avatar', '@base-ui/react/button', '@base-ui/react/checkbox', '@base-ui/react/checkbox-group', '@base-ui/react/collapsible', '@base-ui/react/dialog', '@base-ui/react/drawer', '@base-ui/react/field', '@base-ui/react/fieldset', '@base-ui/react/input', '@base-ui/react/menu', '@base-ui/react/popover', '@base-ui/react/progress', '@base-ui/react/radio', '@base-ui/react/radio-group', '@base-ui/react/scroll-area', '@base-ui/react/select', '@base-ui/react/separator', '@base-ui/react/switch', '@base-ui/react/tabs', '@base-ui/react/toast', '@base-ui/react/toggle', '@base-ui/react/toolbar', '@base-ui/react/tooltip', '@floating-ui/react-dom',
      ],
    },
    resolve: {
      ...config.resolve,
      alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
    },
  }),
} satisfies StorybookConfig;
