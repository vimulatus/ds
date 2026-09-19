import '@fontsource-variable/inter';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/roboto-mono';
import '../src/styles/tokens.css';
import './docs.css';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { themes } from 'storybook/theming';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS, type ViewportMap } from 'storybook/viewport';
import { ImperativeDialogHost } from '../src/components/ImperativeDialog';
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

/** Hosts dialogs opened with `confirmDialog()` and `openDialog()`, as an app root does. */
const withDialogHost: Decorator = (Story) => (
  <>
    <Story />
    <ImperativeDialogHost />
  </>
);

type Theme = 'dark' | 'light';

/**
 * Docs pages follow the toolbar theme too: the page chrome switches with it,
 * and live examples on an MDX page, which runs no decorators, get the theme
 * on <html>.
 */
function ThemedDocs(props: DocsContainerProps) {
  const store = (props.context as unknown as { store: { userGlobals: { get: () => { theme?: Theme } } } }).store;
  const [theme, setTheme] = useState<Theme>(store.userGlobals.get().theme ?? 'dark');
  useEffect(() => {
    const onUpdate = ({ globals }: { globals: { theme?: Theme } }) => setTheme(globals.theme ?? 'dark');
    props.context.channel.on(GLOBALS_UPDATED, onUpdate);
    return () => props.context.channel.off(GLOBALS_UPDATED, onUpdate);
  }, [props.context.channel]);
  document.documentElement.dataset.theme = theme;
  return <DocsContainer {...props} theme={theme === 'light' ? themes.light : themes.dark} />;
}

export default {
  decorators: [withDialogHost, withTheme, withDevice],
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
    docs: { container: ThemedDocs },
    viewport: { options: VIEWPORTS },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Principles', 'Copy', 'Foundations', 'Primitives', 'Forms', 'Menus', 'Parts', 'Lists', 'Patterns'],
      },
    },
  },
} satisfies Preview;
