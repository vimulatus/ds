import { createPortal } from 'react-dom';
import { ToastRegionList } from './Toast';

/** Where toasts appear. Mount once, at the root. */
export function ToastRegion() {
  return createPortal(
    <>
      {/*
        Desktop stack, bottom-right. Persistent prompts get their own region
        capped at one visible card.
      */}
      <div className="fixed bottom-2 right-2 m-0 p-2 sm:p-4 list-none outline-none pointer-events-none z-toast-region flex flex-col items-end gap-2">
        <ToastRegionList region="prompt-region" limit={1} swipeDirection="right" />
        <ToastRegionList region="toast-region" swipeDirection="right" />
        <ToastRegionList region="stable-toast" swipeDirection="right" />
      </div>

      {/*
        Phone stack: centered above the dock. At most one transient toast is
        visible; persistent prompts sit above that slot, one at a time.
      */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[420px] px-(--mobile-chrome-gutter) pointer-events-none z-toast-region flex flex-col gap-2"
        style={{ bottom: 'calc(var(--mobile-content-inset-bottom, 0px) + 12px)' }}
      >
        <ToastRegionList region="mobile-prompt-region" limit={1} swipeDirection="left" />
        <ToastRegionList region="mobile-toast-region" swipeDirection="left" />
      </div>
    </>,
    document.body
  );
}
