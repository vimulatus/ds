import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

export type FilteredHiddenBannerProps = {
  /**
   * Whether to say that filters hide items. When false the banner shrinks to
   * its Clear Filters button. Defaults to showing the message.
   */
  hasHiddenItems?: boolean;
  onClearFilters: () => void;
};

/**
 * Says that filters hide items and clears them in one click. Inside an empty
 * state that already says why the list is empty, pass `hasHiddenItems={false}`.
 * Never show it while no filter is on.
 */
export function FilteredHiddenBanner({ hasHiddenItems, onClearFilters }: FilteredHiddenBannerProps) {
  const showMessage = hasHiddenItems !== false;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-md border border-edge-muted bg-input/50 px-3 py-1',
        showMessage ? 'w-full max-w-md justify-between' : 'w-fit'
      )}
    >
      {showMessage && <span className="text-sm text-ink-muted">Some items are hidden by filters</span>}
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent transition-colors"
      >
        Clear Filters
        <X className="size-3.5" />
      </button>
    </div>
  );
}
