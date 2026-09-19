import { Toast as Base } from '@base-ui/react/toast';
import { Check, ExclamationMark, Spinner, X } from '@phosphor-icons/react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { isMobile } from '@/lib/mobile';
import { Button } from './Button';
import { Surface } from './Surface';

export enum ToastType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  ALERT = 'alert',
  LOADING = 'loading',
}

type IconComponent = ComponentType<{ className?: string }>;

interface ToastStyle {
  /** Accent color for the icon's disc and the custom ring. */
  borderColor: string;
  icon: IconComponent;
}

const TOAST_STYLES: Record<ToastType, ToastStyle> = {
  [ToastType.SUCCESS]: { borderColor: 'var(--color-success)', icon: Check },
  [ToastType.FAILURE]: { borderColor: 'var(--color-failure)', icon: ExclamationMark },
  [ToastType.ALERT]: { borderColor: 'var(--color-alert)', icon: ExclamationMark },
  [ToastType.LOADING]: { borderColor: 'var(--color-edge)', icon: Spinner },
};

/** A single entry in the actions row — icon and label rendered as a button */
export interface ToastAction {
  label: string;
  icon?: IconComponent;
  onClick: () => void;
}

/** Common options for all toast calls. */
interface ToastOptions {
  subtext?: string;
  /** Auto-dismiss duration in ms. When omitted, the toast uses a default 3s timer. */
  duration?: number;
  /** When true, don't render this toast on mobile. */
  hideOnMobile?: boolean;
}

interface ToastSuccessOptions extends ToastOptions {
  actions?: ToastAction[];
  /** When true, bypasses the 3s duplicate-message throttle. */
  stack?: boolean;
}

/**
 * Config for a fully custom toast. Replaces the icon, title, and accent
 * color of the standard layout while keeping the shared chrome and dismiss
 * machinery.
 */
export interface CustomToastConfig {
  title: string;
  content?: () => ReactNode;
  icon?: IconComponent;
  /** Any CSS color value, e.g. 'var(--color-success)' or '#ff6600' */
  color?: string;
  actions?: ToastAction[];
}

/** What a toast renders, carried on Base UI's toast object. */
type ToastData = {
  toastType?: ToastType;
  message?: string;
  subtext?: string;
  actions?: ToastAction[];
  persistent?: boolean;
  embed?: ComponentType;
  custom?: CustomToastConfig;
  mobile?: boolean;
  skipOpenAnimation?: boolean;
};

type Region = 'prompt-region' | 'toast-region' | 'stable-toast' | 'mobile-prompt-region' | 'mobile-toast-region';

const managers: Record<Region, ReturnType<typeof Base.createToastManager>> = {
  'prompt-region': Base.createToastManager(),
  'toast-region': Base.createToastManager(),
  'stable-toast': Base.createToastManager(),
  'mobile-prompt-region': Base.createToastManager(),
  'mobile-toast-region': Base.createToastManager(),
};

/**
 * The toast showing in each transient region. Each new toast dismisses the
 * previous one at once, so transient notifications never stack.
 */
const activeToast: Partial<Record<Region, string>> = {};

function show(region: Region, data: ToastData, options: { duration?: number; onDismiss?: () => void } = {}) {
  const id = managers[region].add({
    timeout: data.persistent ? 0 : (options.duration ?? 3000),
    data,
    onRemove: () => {
      if (activeToast[region] === id) delete activeToast[region];
      options.onDismiss?.();
    },
  });
  return id;
}

function dismissActiveToast(region: Region): boolean {
  const id = activeToast[region];
  if (id === undefined) return false;
  delete activeToast[region];
  managers[region].close(id);
  return true;
}

/**
 * Hand the region's single visible slot to a new toast, and report whether it
 * displaced one (so the newcomer can skip its entrance animation).
 *
 * Persistent toasts opt out of the slot: they are prompts the person is
 * expected to answer, so a passing "Copied" must not tear one down, and a
 * prompt appearing must not swallow a result the person is still reading.
 */
function replaceActiveToast(region: Region, persistent?: boolean): boolean {
  if (persistent) return false;
  return dismissActiveToast(region);
}

function trackActiveToast(region: Region, id: string, persistent?: boolean) {
  if (!persistent) activeToast[region] = id;
}

function transientRegion(): Region {
  return isMobile() ? 'mobile-toast-region' : 'toast-region';
}

const THROTTLE_DURATION = 3000;
const recentToasts = new Map<string, { timestamp: number; id: string; timeoutId: ReturnType<typeof setTimeout> }>();

const toastKey = (message: string, type: ToastType) => `${type}:${message}`;

function dismissIfRecent(message: string, type: ToastType) {
  const recent = recentToasts.get(toastKey(message, type));
  if (recent && Date.now() - recent.timestamp < THROTTLE_DURATION) dismiss(recent.id);
}

function createToast(message: string, toastType: ToastType, options: ToastSuccessOptions = {}) {
  const { subtext, actions, duration, stack, hideOnMobile } = options;
  if (isMobile() && hideOnMobile) return undefined;
  const key = toastKey(message, toastType);
  if (!stack) clearTimeout(recentToasts.get(key)?.timeoutId);

  const region = transientRegion();
  const skipOpenAnimation = dismissActiveToast(region);
  const id = show(
    region,
    { toastType, message, subtext, actions, mobile: region === 'mobile-toast-region', skipOpenAnimation },
    { duration }
  );
  activeToast[region] = id;

  if (!stack) {
    const timeoutId = setTimeout(() => recentToasts.delete(key), THROTTLE_DURATION);
    recentToasts.set(key, { timestamp: Date.now(), id, timeoutId });
  }
  return id;
}

// Tell people that an action has successfully completed
function success(message: string, options?: ToastSuccessOptions): string | undefined {
  if (!options?.stack) dismissIfRecent(message, ToastType.SUCCESS);
  return createToast(message, ToastType.SUCCESS, options);
}

// Tell people that an action has failed, because of us
function failure(message: string, options?: ToastOptions & { actions?: ToastAction[] }) {
  dismissIfRecent(message, ToastType.FAILURE);
  createToast(message, ToastType.FAILURE, options);
}

// Tell people that an action has failed, because of them
function alert(message: string, options?: ToastOptions) {
  dismissIfRecent(message, ToastType.ALERT);
  createToast(message, ToastType.ALERT, options);
}

function dismiss(toastId: string) {
  for (const manager of Object.values(managers)) manager.close(toastId);
}

async function promise<T>(
  work: Promise<T>,
  options: {
    loading: string;
    success?: string | ((result: T) => string);
    error?: string | ((error: unknown) => string);
    toastTypeDeterminer?: (result: T) => ToastType;
    subtext?: string;
    /** When true, don't render the loading/result toasts on mobile. */
    hideOnMobile?: boolean;
  }
): Promise<T> {
  if (isMobile() && options.hideOnMobile) return work;
  const region = transientRegion();
  const skipOpenAnimation = dismissActiveToast(region);
  const id = show(region, {
    toastType: ToastType.LOADING,
    message: options.loading,
    subtext: options.subtext,
    persistent: true,
    mobile: region === 'mobile-toast-region',
    skipOpenAnimation,
  });
  activeToast[region] = id;

  try {
    const result = await work;
    dismiss(id);
    if (options.success) {
      const message = typeof options.success === 'function' ? options.success(result) : options.success;
      createToast(message, options.toastTypeDeterminer?.(result) ?? ToastType.SUCCESS, {
        hideOnMobile: options.hideOnMobile,
      });
    }
    return result;
  } catch (error) {
    dismiss(id);
    if (options.error) {
      const message = typeof options.error === 'function' ? options.error(error) : options.error;
      failure(message, { hideOnMobile: options.hideOnMobile });
    }
    throw error;
  }
}

function embed(component: ComponentType, options?: { persistent?: boolean; duration?: number; region?: Region }) {
  const region = options?.region ?? transientRegion();
  const skipOpenAnimation = replaceActiveToast(region, options?.persistent);
  const id = show(
    region,
    { embed: component, persistent: options?.persistent, mobile: isMobile(), skipOpenAnimation },
    { duration: options?.duration }
  );
  trackActiveToast(region, id, options?.persistent);
  return id;
}

/**
 * Show a toast with a fully custom title, icon, accent color, body content,
 * and actions row, on the shared chrome and dismiss machinery.
 */
function custom(
  config: CustomToastConfig,
  options?: { persistent?: boolean; duration?: number; region?: Region; onDismiss?: () => void }
): string {
  const region = options?.region ?? transientRegion();
  const skipOpenAnimation = replaceActiveToast(region, options?.persistent);
  const id = show(
    region,
    { custom: config, persistent: options?.persistent, mobile: isMobile(), skipOpenAnimation },
    { duration: options?.duration, onDismiss: options?.onDismiss }
  );
  trackActiveToast(region, id, options?.persistent);
  return id;
}

/** A loading toast in its own stable region, for an upload. */
export function createUploadToast(message: string) {
  return show('stable-toast', { toastType: ToastType.LOADING, message, persistent: true });
}

export const toast = { success, failure, alert, promise, embed, custom, dismiss };

// ─── rendering ───────────────────────────────────────────────────────────────

function ActionButtons({ actions, mobile }: { actions: ToastAction[]; mobile?: boolean }) {
  return actions.map((action) => {
    const Icon = action.icon;
    return (
      <Button
        key={action.label}
        size={mobile ? 'sm' : 'md'}
        onClick={action.onClick}
        variant="outlined"
        className="px-2 py-1 bg-surface"
      >
        {Icon && <Icon className="size-[1em] touch:min-h-0! touch:min-w-0!" />}
        {action.label}
      </Button>
    );
  });
}

function CloseButton({ className }: { className?: string }) {
  return (
    <Base.Close
      className={className}
      render={
        <Button variant="ghost" size="icon-sm">
          <X />
        </Button>
      }
    />
  );
}

function ToastBodyWrapper({ mobile, accentColor, children }: { mobile?: boolean; accentColor: string; children: ReactNode }) {
  if (mobile) return <div className="island relative w-full p-2 rounded-xl bg-toast">{children}</div>;
  return (
    <Surface highlightColor={accentColor} hideBorder className="relative w-[90vw] sm:w-md p-2 sm:p-3 rounded-xl glass bg-toast">
      {children}
    </Surface>
  );
}

function CustomLayout({ config, mobile, persistent }: { config: CustomToastConfig; mobile?: boolean; persistent?: boolean }) {
  // A persistent prompt on a phone keeps the full card: description, close
  // button, and its actions on their own row.
  const stacked = Boolean(mobile && persistent);
  const showContent = Boolean(config.content) && (!mobile || stacked);
  const Icon = config.icon;
  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        {Icon && !mobile && (
          <div className="size-5 flex shrink-0 justify-center items-center rounded-full p-0.75">
            <Icon />
          </div>
        )}
        <Base.Title
          render={<div />}
          className={cn(
            'font-semibold grow shrink truncate text-left flex items-center',
            mobile ? 'text-xs' : 'text-ink',
            stacked && 'text-sm'
          )}
        >
          {config.title}
        </Base.Title>
        {config.actions?.length && !stacked ? <ActionButtons actions={config.actions} mobile={mobile} /> : null}
        {(!mobile || persistent) && <CloseButton />}
      </div>
      {showContent && <div className={cn('my-2', mobile && 'text-xs text-ink-muted')}>{config.content?.()}</div>}
      {stacked && config.actions?.length ? (
        <div className="flex justify-end gap-2">
          <ActionButtons actions={config.actions} mobile />
        </div>
      ) : null}
    </>
  );
}

function StandardLayout({ data }: { data: ToastData }) {
  const style = TOAST_STYLES[data.toastType!];
  const Icon = style.icon;
  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <div
          className="size-5 flex shrink-0 justify-center items-center rounded-full p-0.75"
          style={{ backgroundColor: style.borderColor }}
        >
          <Icon className={cn('size-3.5 text-surface', data.toastType === ToastType.LOADING ? 'animate-spin' : '')} />
        </div>
        <Base.Title
          render={<div />}
          className={cn('font-semibold grow shrink truncate text-left', data.mobile ? 'text-xs' : 'text-ink')}
        >
          {data.message}
        </Base.Title>
        {data.actions?.length ? <ActionButtons actions={data.actions} mobile={data.mobile} /> : null}
        {!data.mobile && <CloseButton />}
      </div>
      {data.subtext && !data.mobile && (
        <Base.Description render={<div />} className="text-sm text-ink-extra-muted ml-7">
          {data.subtext}
        </Base.Description>
      )}
    </>
  );
}

type ToastObject = ReturnType<typeof Base.useToastManager>['toasts'][number];

function ToastContent({ toast: item, swipeDirection }: { toast: ToastObject; swipeDirection: 'left' | 'right' }) {
  const data = (item.data ?? {}) as ToastData;
  const accentColor = data.custom?.color ?? (data.toastType ? TOAST_STYLES[data.toastType].borderColor : 'var(--color-edge)');
  const Embed = data.embed;
  return (
    <Base.Root
      toast={item}
      swipeDirection={swipeDirection}
      render={<li />}
      // The copied swipe-out keyframes start from --kb-toast-swipe-end-x.
      style={{ '--kb-toast-swipe-end-x': 'var(--toast-swipe-movement-x)' } as CSSProperties}
      className={cn(
        `relative overflow-visible pointer-events-auto
        transition-[transform,opacity] duration-100 ease-in data-ending-style:opacity-0 data-swiping:translate-x-(--toast-swipe-movement-x)
        data-swiping:transition-none
        data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:ease-out data-[swipe=cancel]:duration-200
        data-ending-style:data-[swipe-direction=right]:animate-swipe-out
        data-ending-style:data-[swipe-direction=left]:animate-swipe-out-left`,
        !data.skipOpenAnimation && 'animate-slide-in',
        data.mobile && 'w-full'
      )}
    >
      <ToastBodyWrapper mobile={data.mobile} accentColor={accentColor}>
        {Embed ? (
          <>
            <Embed />
            <CloseButton className="absolute top-2 right-2 z-user-highlight" />
          </>
        ) : data.custom ? (
          <CustomLayout config={data.custom} mobile={data.mobile} persistent={data.persistent} />
        ) : data.toastType ? (
          <StandardLayout data={data} />
        ) : null}
      </ToastBodyWrapper>
    </Base.Root>
  );
}

function RegionList({ swipeDirection }: { swipeDirection: 'left' | 'right' }) {
  const { toasts } = Base.useToastManager();
  return (
    <ol className="flex flex-col gap-2">
      {toasts
        .filter((item) => !item.limited)
        .map((item) => (
          <ToastContent key={item.id} toast={item} swipeDirection={swipeDirection} />
        ))}
    </ol>
  );
}

/** One toast region: its own queue, list and swipe direction. */
export function ToastRegionList({
  region,
  limit = 100,
  swipeDirection,
}: {
  region: Region;
  limit?: number;
  swipeDirection: 'left' | 'right';
}) {
  return (
    <Base.Provider toastManager={managers[region]} limit={limit} timeout={0}>
      <Base.Viewport>
        <RegionList swipeDirection={swipeDirection} />
      </Base.Viewport>
    </Base.Provider>
  );
}
