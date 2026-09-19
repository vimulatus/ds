/**
 * Renders a story as a phone: the iPhone 14 viewport, which also turns on
 * touch mode. Phone stories stay off the docs page, which renders at
 * desktop width.
 */
export const PHONE = {
  globals: { viewport: { value: 'iphone14', isRotated: false } },
  tags: ['!autodocs'],
};
