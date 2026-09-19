import '@fontsource-variable/inter';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/roboto-mono';
import '../src/styles/tokens.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS, type ViewportMap } from 'storybook/viewport';
import { TooltipProvider } from '../src/components/Tooltip';
import { setTouch } from '../src/lib/touch';

const VIEWPORTS: ViewportMap = {
  iphone14: INITIAL_VIEWPORTS.iphone14!,
  ...MINIMAL_VIEWPORTS,
};

/** A phone or tablet viewport puts the story in touch mode. */
const withDevice: Decorator = (Story, context) => {
  const viewport = context.globals.viewport;
  const key = typeof viewport === 'string' ? viewport : viewport?.value;
  const type = key ? VIEWPORTS[key]?.type : undefined;
  setTouch(type === 'mobile' || type === 'tablet');
  return <Story />;
};

const withTheme: Decorator = (Story, context) => {
  document.documentElement.dataset.theme = context.globals.theme;
  return <Story />;
};

const withProviders: Decorator = (Story) => (
  <TooltipProvider delay={400}>
    <Story />
  </TooltipProvider>
);

export default {
  decorators: [withProviders, withTheme, withDevice],
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'dark' },
  parameters: {
    layout: 'padded',
    viewport: { options: VIEWPORTS },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Principles', 'Writing', 'Foundations', 'Primitives', 'Forms', 'Menus', 'Parts', 'Lists', 'Patterns'],
      },
    },
  },
} satisfies Preview;
