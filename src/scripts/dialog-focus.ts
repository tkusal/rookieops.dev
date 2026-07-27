const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

type BackgroundState = {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
};

interface DialogControllerOptions {
  dialog: HTMLElement;
  preserve?: HTMLElement[];
  initialFocus?: () => HTMLElement | null;
  onEscape: () => void;
}

export function createDialogController({
  dialog,
  preserve = [],
  initialFocus,
  onEscape
}: DialogControllerOptions) {
  let active = false;
  let previouslyFocused: HTMLElement | null = null;
  let previousBodyOverflow = '';
  let backgroundState: BackgroundState[] = [];

  const focusableElements = () =>
    [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
      .filter((element) => element.getClientRects().length > 0);

  const handleKeydown = (event: KeyboardEvent) => {
    if (!active) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = focusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (!dialog.contains(current)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const activate = () => {
    if (active) return;
    active = true;
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousBodyOverflow = document.body.style.overflow;

    const background = document.querySelectorAll<HTMLElement>(
      '[data-page-shell], [data-reading-progress], #search-modal, #search-overlay, [data-lightbox-root]'
    );
    backgroundState = [...background]
      .filter((element) =>
        element !== dialog &&
        !element.contains(dialog) &&
        !preserve.some((preserved) => preserved === element || preserved.contains(element))
      )
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute('aria-hidden')
      }));

    for (const state of backgroundState) {
      state.element.inert = true;
      state.element.setAttribute('aria-hidden', 'true');
    }

    dialog.inert = false;
    dialog.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);

    window.requestAnimationFrame(() => {
      (initialFocus?.() || focusableElements()[0] || dialog).focus();
    });
  };

  const deactivate = () => {
    if (!active) return;
    active = false;
    dialog.inert = true;
    dialog.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousBodyOverflow;
    document.removeEventListener('keydown', handleKeydown);

    for (const state of backgroundState) {
      state.element.inert = state.inert;
      if (state.ariaHidden === null) state.element.removeAttribute('aria-hidden');
      else state.element.setAttribute('aria-hidden', state.ariaHidden);
    }
    backgroundState = [];

    window.setTimeout(() => previouslyFocused?.focus(), 0);
  };

  return {
    activate,
    deactivate,
    isActive: () => active
  };
}
