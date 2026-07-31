type FilterKind = 'category' | 'tag';
type FilterState = Record<FilterKind, string>;

const parameterByKind: Record<FilterKind, string> = {
  category: 'category',
  tag: 'tag'
};

function setupArchiveFilters(root: HTMLElement) {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-archive-filter-kind]')];
  const entries = [...document.querySelectorAll<HTMLElement>('[data-archive-entry]')];
  const months = [...document.querySelectorAll<HTMLElement>('[data-archive-month]')];
  const years = [...document.querySelectorAll<HTMLElement>('[data-archive-year]')];
  const resultCount = root.querySelector<HTMLElement>('[data-archive-result-count]');
  const emptyState = root.querySelector<HTMLElement>('[data-archive-empty]');
  const available = {
    category: new Set(buttons.filter((button) => button.dataset.archiveFilterKind === 'category').map((button) => button.dataset.archiveFilterValue || '')),
    tag: new Set(buttons.filter((button) => button.dataset.archiveFilterKind === 'tag').map((button) => button.dataset.archiveFilterValue || ''))
  };

  function readState() {
    const url = new URL(window.location.href);
    const state: FilterState = { category: '', tag: '' };
    let changed = false;

    for (const kind of Object.keys(parameterByKind) as FilterKind[]) {
      const parameter = parameterByKind[kind];
      const requested = url.searchParams.get(parameter);
      if (requested && available[kind].has(requested)) {
        state[kind] = requested;
      } else if (requested !== null) {
        url.searchParams.delete(parameter);
        changed = true;
      }
    }

    if (changed) window.history.replaceState({}, '', url);
    return state;
  }

  function entryTerms(entry: HTMLElement, key: 'categories' | 'tags') {
    return JSON.parse(entry.dataset[key] || '[]') as string[];
  }

  function updateTagOptions(state: FilterState) {
    const categoryEntries = state.category
      ? entries.filter((entry) => entryTerms(entry, 'categories').includes(state.category))
      : entries;
    const tagCounts = new Map<string, number>();

    for (const entry of categoryEntries) {
      for (const tag of entryTerms(entry, 'tags')) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    for (const button of buttons) {
      if (button.dataset.archiveFilterKind !== 'tag') continue;

      const value = button.dataset.archiveFilterValue || '';
      const count = value ? tagCounts.get(value) || 0 : categoryEntries.length;
      const countElement = button.querySelector<HTMLElement>('[data-archive-filter-count]');
      if (countElement) countElement.textContent = String(count);
      button.hidden = Boolean(value) && count === 0;
    }

    if (state.tag && !tagCounts.has(state.tag)) {
      state.tag = '';
      const url = new URL(window.location.href);
      url.searchParams.delete(parameterByKind.tag);
      window.history.replaceState({}, '', url);
    }
  }

  function applyState(state: FilterState) {
    updateTagOptions(state);

    for (const button of buttons) {
      const kind = button.dataset.archiveFilterKind as FilterKind;
      const value = button.dataset.archiveFilterValue || '';
      const selected = state[kind] === value;
      button.setAttribute('aria-pressed', String(selected));
    }

    let visibleCount = 0;
    for (const entry of entries) {
      const matchesCategory = !state.category || entryTerms(entry, 'categories').includes(state.category);
      const matchesTag = !state.tag || entryTerms(entry, 'tags').includes(state.tag);
      entry.hidden = !(matchesCategory && matchesTag);
      if (!entry.hidden) visibleCount += 1;
    }

    for (const month of months) {
      month.hidden = !month.querySelector<HTMLElement>('[data-archive-entry]:not([hidden])');
    }

    for (const year of years) {
      year.hidden = !year.querySelector<HTMLElement>('[data-archive-entry]:not([hidden])');
    }

    if (resultCount) resultCount.textContent = String(visibleCount);
    if (emptyState) emptyState.hidden = visibleCount > 0;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const kind = button.dataset.archiveFilterKind as FilterKind;
      const value = button.dataset.archiveFilterValue || '';
      const url = new URL(window.location.href);
      if (value) url.searchParams.set(parameterByKind[kind], value);
      else url.searchParams.delete(parameterByKind[kind]);
      window.history.pushState({}, '', url);
      applyState(readState());
    });
  }

  window.addEventListener('popstate', () => applyState(readState()));
  applyState(readState());
  root.hidden = false;
}

for (const root of document.querySelectorAll<HTMLElement>('[data-archive-filter-root]')) {
  setupArchiveFilters(root);
}
