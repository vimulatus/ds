import { type ComponentType, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/** Props controlled by the imperative dialog manager. */
export type ManagedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** A static source of component props, or a function read on each render of the host. */
export type PropsSource<P extends object> = P | (() => P);

/** Options controlling an imperative dialog's lifecycle. */
export type OpenDialogOptions = {
  /** Closes the dialog with reason `owner-disposed` when this signal aborts. */
  signal?: AbortSignal;
};

/** Why an imperative dialog was closed. */
export type DialogCloseReason = 'dismissed' | 'programmatic' | 'replaced' | 'owner-disposed' | 'host-disposed';

/** Information emitted after an imperative dialog has been cleaned up. */
export type DialogClosedEvent = {
  id: string;
  reason: DialogCloseReason;
};

/** A stable handle to one imperative dialog entry. */
export type DialogHandle = {
  readonly id: string;
  readonly isOpen: () => boolean;
  /** Closes this dialog. Returns false when it was already closed. */
  close: () => boolean;
  /** Resolves once the dialog has left the host. */
  readonly closed: Promise<DialogClosedEvent>;
};

/** Props callers provide when opening a managed dialog. */
export type ManagedDialogInput<P extends ManagedDialogProps> = Omit<P, keyof ManagedDialogProps> &
  Partial<Record<keyof ManagedDialogProps, never>>;

/** Controls the single active dialog owned by `useImperativeDialog`. */
export type ImperativeDialogController<P extends ManagedDialogProps> = {
  /** Opens this dialog, replacing the controller's current entry. */
  open: (props: PropsSource<ManagedDialogInput<P>>) => DialogHandle;
  /** Closes the current entry. Returns false when none is open. */
  close: () => boolean;
  /** Whether this controller currently owns an open entry. */
  readonly isOpen: boolean;
  /** The current entry-specific handle. */
  readonly handle: DialogHandle | undefined;
};

type Entry = {
  id: string;
  component: ComponentType<ManagedDialogProps & Record<string, unknown>>;
  props: PropsSource<Record<string, unknown>>;
  finalized: boolean;
  resolveClosed: (event: DialogClosedEvent) => void;
};

let entries: Entry[] = [];
let nextDialogId = 0;
const listeners = new Set<() => void>();

function setEntries(next: Entry[]) {
  entries = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function finalizeDialog(id: string, reason: DialogCloseReason): boolean {
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry || entry.finalized) return false;
  entry.finalized = true;
  setEntries(entries.filter((candidate) => candidate !== entry));
  entry.resolveClosed({ id, reason });
  return true;
}

/**
 * Opens a complete, controlled dialog component in the global dialog host.
 * The manager supplies `open` and `onOpenChange`; the component owns its
 * `<Dialog>` and all presentation details. Needs `<ImperativeDialogHost />`
 * mounted once.
 */
export function openDialog<P extends ManagedDialogProps>(
  component: ComponentType<P>,
  props: PropsSource<ManagedDialogInput<P>>,
  options: OpenDialogOptions = {}
): DialogHandle {
  const id = `imperative-dialog-${++nextDialogId}`;
  let resolveClosed!: (event: DialogClosedEvent) => void;
  const closed = new Promise<DialogClosedEvent>((resolve) => {
    resolveClosed = resolve;
  });
  const entry: Entry = {
    id,
    component: component as unknown as Entry['component'],
    props: props as PropsSource<Record<string, unknown>>,
    finalized: false,
    resolveClosed,
  };
  setEntries([...entries, entry]);
  options.signal?.addEventListener('abort', () => finalizeDialog(id, 'owner-disposed'), { once: true });

  return {
    id,
    isOpen: () => !entry.finalized,
    close: () => finalizeDialog(id, 'programmatic'),
    closed,
  };
}

/**
 * A single-slot dialog controller bound to the calling component. Opening
 * again replaces only the entry this controller created, and unmounting the
 * component closes it.
 */
export function useImperativeDialog<P extends ManagedDialogProps>(
  component: ComponentType<P>
): ImperativeDialogController<P> {
  const [handle, setHandle] = useState<DialogHandle>();
  const current = useRef<DialogHandle | undefined>(undefined);
  const owner = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    owner.current = controller;
    return () => controller.abort();
  }, []);

  const open = useCallback(
    (props: PropsSource<ManagedDialogInput<P>>) => {
      const previous = current.current;
      if (previous?.isOpen()) finalizeDialog(previous.id, 'replaced');
      const next = openDialog(component, props, { signal: owner.current?.signal });
      current.current = next;
      setHandle(next);
      void next.closed.then(() => {
        if (current.current !== next) return;
        current.current = undefined;
        setHandle(undefined);
      });
      return next;
    },
    [component]
  );

  const close = useCallback(() => current.current?.close() ?? false, []);

  return { open, close, isOpen: handle?.isOpen() ?? false, handle };
}

function resolveProps(source: PropsSource<Record<string, unknown>>) {
  return typeof source === 'function' ? source() : source;
}

/** Mounts and owns all dialogs opened through `openDialog`. Mount once. */
export function ImperativeDialogHost() {
  const list = useSyncExternalStore(subscribe, () => entries, () => entries);

  useEffect(
    () => () => {
      for (const entry of [...entries]) finalizeDialog(entry.id, 'host-disposed');
    },
    []
  );

  return list.map((entry) => {
    const Component = entry.component;
    return (
      <Component
        key={entry.id}
        {...resolveProps(entry.props)}
        open
        onOpenChange={(open: boolean) => {
          if (!open) finalizeDialog(entry.id, 'dismissed');
        }}
      />
    );
  });
}
