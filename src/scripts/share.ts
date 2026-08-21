const resetTimers = new WeakMap<HTMLButtonElement, number>();

function fallbackCopy(value: string) {
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  const executeCopy = Reflect.get(document, 'execCommand') as
    ((commandId: string) => boolean) | undefined;
  const copied = executeCopy?.call(document, 'copy') ?? false;
  input.remove();

  if (!copied) throw new Error('Copy command failed');
}

async function copyLink(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall back for browsers that expose the API but block clipboard access.
    }
  }

  fallbackCopy(value);
}

function showFeedback(button: HTMLButtonElement, message: string, success: boolean) {
  const label = button.querySelector<HTMLElement>('[data-share-label]');
  const feedback = button.parentElement?.querySelector<HTMLElement>('[data-share-feedback]');
  const defaultIcon = button.querySelector<HTMLElement>('[data-share-default-icon]');
  const successIcon = button.querySelector<HTMLElement>('[data-share-success-icon]');
  const chevron = button.querySelector<HTMLElement>('[data-share-chevron]');

  if (!label || !feedback) return;

  const existingTimer = resetTimers.get(button);
  if (existingTimer) window.clearTimeout(existingTimer);

  label.textContent = message;
  feedback.textContent = message;
  defaultIcon?.classList.toggle('hidden', success);
  successIcon?.classList.toggle('hidden', !success);
  chevron?.classList.add('hidden');

  const timer = window.setTimeout(() => {
    label.textContent = button.dataset.shareAction || '';
    feedback.textContent = '';
    defaultIcon?.classList.remove('hidden');
    successIcon?.classList.add('hidden');
    chevron?.classList.remove('hidden');
    resetTimers.delete(button);
  }, 2400);

  resetTimers.set(button, timer);
}

for (const root of document.querySelectorAll<HTMLElement>('[data-share-root]')) {
  const toggle = root.querySelector<HTMLButtonElement>('[data-share-toggle]');
  const menu = root.querySelector<HTMLElement>('[data-share-menu]');
  const copyButton = root.querySelector<HTMLButtonElement>('[data-share-copy]');
  const menuItems = [...root.querySelectorAll<HTMLElement>('[role="menuitem"]')];

  if (!toggle || !menu || !copyButton || menuItems.length === 0) continue;

  const canonicalUrl =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || window.location.href;
  const title = toggle.dataset.shareTitle || document.title;
  const whatsapp = root.querySelector<HTMLAnchorElement>('[data-share-platform="whatsapp"]');
  const linkedin = root.querySelector<HTMLAnchorElement>('[data-share-platform="linkedin"]');
  const x = root.querySelector<HTMLAnchorElement>('[data-share-platform="x"]');

  if (whatsapp) {
    whatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${title}\n${canonicalUrl}`)}`;
  }
  if (linkedin) {
    linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;
  }
  if (x) {
    x.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonicalUrl)}`;
  }

  const closeMenu = (restoreFocus = false) => {
    if (menu.classList.contains('hidden')) return;
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector<HTMLElement>('[data-share-chevron]')?.classList.remove('rotate-180');
    if (restoreFocus) toggle.focus();
  };

  const openMenu = () => {
    menu.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector<HTMLElement>('[data-share-chevron]')?.classList.add('rotate-180');
    window.requestAnimationFrame(() => menuItems[0]?.focus());
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('hidden')) openMenu();
    else closeMenu();
  });

  for (const link of root.querySelectorAll<HTMLAnchorElement>('[data-share-platform]')) {
    link.addEventListener('click', () => closeMenu());
  }

  copyButton.addEventListener('click', async () => {
    closeMenu();
    try {
      await copyLink(canonicalUrl);
      showFeedback(toggle, toggle.dataset.shareCopied || '', true);
    } catch {
      showFeedback(toggle, toggle.dataset.shareError || '', false);
    }
    toggle.focus();
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (menu.classList.contains('hidden')) {
      if (event.target === toggle && event.key === 'ArrowDown') {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % menuItems.length;
    if (event.key === 'ArrowUp')
      nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = menuItems.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      menuItems[nextIndex]?.focus();
    }
  });

  root.addEventListener('focusout', () => {
    window.requestAnimationFrame(() => {
      if (!root.contains(document.activeElement)) closeMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !root.contains(event.target)) closeMenu();
  });
}
