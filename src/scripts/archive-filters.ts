type FilterKind = 'category' | 'tag' | 'difficulty';

type FilterState = {
  category: string;
  tags: string[];
  difficulty: string;
};

type ArchiveFilterLabels = {
  chooseTags: string;
  selectedTag: string;
  selectedTags: string;
  removedTags: string;
  removeFilter: string;
  foundSingle: string;
  foundPlural: string;
};

declare global {
  interface Window {
    archiveFilterLabels?: ArchiveFilterLabels;
  }
}

const parameterByKind = {
  category: 'category',
  tag: 'tag',
  difficulty: 'difficulty'
} as const;

const defaultLabels: ArchiveFilterLabels = {
  chooseTags: 'Selecionar tags',
  selectedTag: 'tag selecionada',
  selectedTags: 'tags selecionadas',
  removedTags: 'Algumas tags foram removidas porque não estão disponíveis nesta categoria.',
  removeFilter: 'Remover filtro',
  foundSingle: 'artigo encontrado',
  foundPlural: 'artigos encontrados'
};

function setupArchiveFilters(root: HTMLElement) {
  const labels = { ...defaultLabels, ...window.archiveFilterLabels };
  const controls = [...root.querySelectorAll<HTMLElement>('[data-archive-filter-kind]')];
  const entries = [...document.querySelectorAll<HTMLElement>('[data-archive-entry]')];
  const months = [...document.querySelectorAll<HTMLElement>('[data-archive-month]')];
  const years = [...document.querySelectorAll<HTMLElement>('[data-archive-year]')];
  const resultCount = root.querySelector<HTMLElement>('[data-archive-result-count]');
  const resultLabel = root.querySelector<HTMLElement>('[data-archive-result-label]');
  const emptyState = root.querySelector<HTMLElement>('[data-archive-empty]');
  const filterNotice = root.querySelector<HTMLElement>('[data-archive-filter-notice]');
  const activeFilters = root.querySelector<HTMLElement>('[data-archive-active]');
  const activeList = root.querySelector<HTMLElement>('[data-archive-active-list]');
  const clearButton = root.querySelector<HTMLButtonElement>('[data-archive-clear]');
  const tagSelect = root.querySelector<HTMLElement>('[data-archive-tag-select]');
  const tagToggle = root.querySelector<HTMLButtonElement>('[data-archive-tag-toggle]');
  const tagPanel = root.querySelector<HTMLElement>('[data-archive-tag-panel]');
  const tagSearch = root.querySelector<HTMLInputElement>('[data-archive-tag-search]');
  const tagOptions = root.querySelector<HTMLElement>('[data-archive-tag-options]');
  const tagRows = [...root.querySelectorAll<HTMLElement>('[data-archive-tag-row]')];
  const tagSummary = root.querySelector<HTMLElement>('[data-archive-tag-summary]');
  const tagBadge = root.querySelector<HTMLElement>('[data-archive-tag-badge]');
  const tagChevron = root.querySelector<HTMLElement>('[data-archive-tag-chevron]');
  const unavailableTags = root.querySelector<HTMLElement>('[data-archive-tag-unavailable]');
  const noTagResults = root.querySelector<HTMLElement>('[data-archive-tag-no-results]');
  const available = {
    category: new Set(controls.filter((control) => control.dataset.archiveFilterKind === 'category').map((control) => control.dataset.archiveFilterValue || '')),
    tag: new Set(controls.filter((control) => control.dataset.archiveFilterKind === 'tag').map((control) => control.dataset.archiveFilterValue || '')),
    difficulty: new Set(controls.filter((control) => control.dataset.archiveFilterKind === 'difficulty').map((control) => control.dataset.archiveFilterValue || ''))
  };

  function writeStateToUrl(state: FilterState, method: 'push' | 'replace') {
    const url = new URL(window.location.href);
    for (const parameter of Object.values(parameterByKind)) url.searchParams.delete(parameter);
    if (state.category) url.searchParams.set(parameterByKind.category, state.category);
    for (const tag of state.tags) url.searchParams.append(parameterByKind.tag, tag);
    if (state.difficulty) url.searchParams.set(parameterByKind.difficulty, state.difficulty);
    window.history[method === 'push' ? 'pushState' : 'replaceState']({}, '', url);
  }

  function readState() {
    const url = new URL(window.location.href);
    const state: FilterState = { category: '', tags: [], difficulty: '' };
    let changed = false;

    const requestedCategory = url.searchParams.get(parameterByKind.category);
    if (requestedCategory && available.category.has(requestedCategory)) state.category = requestedCategory;
    else if (requestedCategory !== null) changed = true;

    const requestedDifficulty = url.searchParams.get(parameterByKind.difficulty);
    if (requestedDifficulty && available.difficulty.has(requestedDifficulty)) state.difficulty = requestedDifficulty;
    else if (requestedDifficulty !== null) changed = true;

    const seenTags = new Set<string>();
    for (const requestedTag of url.searchParams.getAll(parameterByKind.tag)) {
      if (available.tag.has(requestedTag) && !seenTags.has(requestedTag)) {
        state.tags.push(requestedTag);
        seenTags.add(requestedTag);
      } else if (available.difficulty.has(requestedTag) && !state.difficulty) {
        state.difficulty = requestedTag;
        changed = true;
      } else {
        changed = true;
      }
    }

    if (changed) writeStateToUrl(state, 'replace');
    return state;
  }

  function entryTerms(entry: HTMLElement, key: 'categories' | 'tags') {
    return JSON.parse(entry.dataset[key] || '[]') as string[];
  }

  function normalize(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(document.documentElement.lang || 'pt-BR');
  }

  function filterTagOptions() {
    const query = normalize(tagSearch?.value.trim() || '');
    let availableCount = 0;
    let visibleCount = 0;

    for (const row of tagRows) {
      const isAvailable = row.dataset.archiveTagAvailable === 'true';
      const matchesSearch = !query || normalize(row.dataset.archiveTagLabel || '').includes(query);
      row.hidden = !isAvailable || !matchesSearch;
      if (isAvailable) availableCount += 1;
      if (!row.hidden) visibleCount += 1;
    }

    if (unavailableTags) unavailableTags.hidden = availableCount > 0;
    if (noTagResults) noTagResults.hidden = availableCount === 0 || visibleCount > 0;
  }

  function updateDependentOptions(state: FilterState) {
    const categoryEntries = state.category
      ? entries.filter((entry) => entryTerms(entry, 'categories').includes(state.category))
      : entries;
    const counts: Record<'tag' | 'difficulty', Map<string, number>> = {
      tag: new Map<string, number>(),
      difficulty: new Map<string, number>()
    };

    for (const entry of categoryEntries) {
      for (const tag of entryTerms(entry, 'tags')) {
        for (const kind of ['tag', 'difficulty'] as const) {
          if (available[kind].has(tag)) counts[kind].set(tag, (counts[kind].get(tag) || 0) + 1);
        }
      }
    }

    for (const control of controls) {
      const kind = control.dataset.archiveFilterKind as FilterKind;
      if (kind !== 'tag' && kind !== 'difficulty') continue;
      const value = control.dataset.archiveFilterValue || '';
      const count = value ? counts[kind].get(value) || 0 : categoryEntries.length;

      if (kind === 'tag') {
        const input = control as HTMLInputElement;
        const row = input.closest<HTMLElement>('[data-archive-tag-row]');
        const countElement = row?.querySelector<HTMLElement>('[data-archive-filter-count]');
        input.disabled = count === 0;
        if (row) {
          row.dataset.archiveTagAvailable = String(count > 0);
          row.dataset.archiveTagCount = String(count);
        }
        if (countElement) countElement.textContent = String(count);
      } else {
        control.hidden = Boolean(value) && count === 0;
      }
    }

    tagRows
      .sort((a, b) => Number(b.dataset.archiveTagCount) - Number(a.dataset.archiveTagCount)
        || (a.dataset.archiveTagLabel || '').localeCompare(b.dataset.archiveTagLabel || '', document.documentElement.lang || 'pt-BR'))
      .forEach((row) => tagOptions?.append(row));
    filterTagOptions();

    const previousTags = state.tags;
    state.tags = state.tags.filter((tag) => counts.tag.has(tag));
    const removedTags = previousTags.length - state.tags.length;
    let changed = removedTags > 0;

    if (state.difficulty && !counts.difficulty.has(state.difficulty)) {
      state.difficulty = '';
      changed = true;
    }

    if (removedTags > 0 && filterNotice) {
      filterNotice.textContent = labels.removedTags;
      filterNotice.hidden = false;
    }
    if (changed) writeStateToUrl(state, 'replace');
  }

  function renderActiveFilters(state: FilterState) {
    if (!activeFilters || !activeList) return;
    const items = [
      ...(state.category ? [{ kind: 'category' as const, value: state.category }] : []),
      ...state.tags.map((value) => ({ kind: 'tag' as const, value })),
      ...(state.difficulty ? [{ kind: 'difficulty' as const, value: state.difficulty }] : [])
    ];

    activeList.replaceChildren();
    activeFilters.hidden = items.length === 0;

    for (const item of items) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.dataset.archiveRemoveKind = item.kind;
      chip.dataset.archiveRemoveValue = item.value;
      chip.className = 'inline-flex min-h-8 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
      chip.setAttribute('aria-label', `${labels.removeFilter}: ${item.value}`);

      const text = document.createElement('span');
      text.textContent = item.value;
      const close = document.createElement('span');
      close.textContent = '×';
      close.setAttribute('aria-hidden', 'true');
      close.className = 'text-sm leading-none text-muted-foreground';
      chip.append(text, close);
      activeList.append(chip);
    }
  }

  function updateTagSummary(state: FilterState) {
    const selectedCount = state.tags.length;
    const selectedLabel = selectedCount === 1 ? labels.selectedTag : labels.selectedTags;
    if (tagSummary) tagSummary.textContent = selectedCount > 0 ? `${selectedCount} ${selectedLabel}` : labels.chooseTags;
    if (tagBadge) {
      tagBadge.textContent = String(selectedCount);
      tagBadge.hidden = selectedCount === 0;
    }
  }

  function applyState(state: FilterState) {
    if (filterNotice) filterNotice.hidden = true;
    updateDependentOptions(state);

    for (const control of controls) {
      const kind = control.dataset.archiveFilterKind as FilterKind;
      const value = control.dataset.archiveFilterValue || '';
      if (kind === 'tag') {
        (control as HTMLInputElement).checked = state.tags.includes(value);
      } else {
        control.setAttribute('aria-pressed', String(state[kind] === value));
      }
    }

    let visibleCount = 0;
    for (const entry of entries) {
      const entryTags = entryTerms(entry, 'tags');
      const matchesCategory = !state.category || entryTerms(entry, 'categories').includes(state.category);
      const matchesTag = state.tags.length === 0 || state.tags.some((tag) => entryTags.includes(tag));
      const matchesDifficulty = !state.difficulty || entryTags.includes(state.difficulty);
      entry.hidden = !(matchesCategory && matchesTag && matchesDifficulty);
      if (!entry.hidden) visibleCount += 1;
    }

    for (const month of months) month.hidden = !month.querySelector<HTMLElement>('[data-archive-entry]:not([hidden])');
    for (const year of years) year.hidden = !year.querySelector<HTMLElement>('[data-archive-entry]:not([hidden])');

    if (resultCount) resultCount.textContent = String(visibleCount);
    if (resultLabel) resultLabel.textContent = visibleCount === 1 ? labels.foundSingle : labels.foundPlural;
    if (emptyState) emptyState.hidden = visibleCount > 0;
    renderActiveFilters(state);
    updateTagSummary(state);
  }

  function setTagPanel(open: boolean) {
    if (!tagPanel || !tagToggle) return;
    tagPanel.hidden = !open;
    tagToggle.setAttribute('aria-expanded', String(open));
    tagChevron?.classList.toggle('rotate-180', open);
    if (open) window.requestAnimationFrame(() => tagSearch?.focus());
    else if (tagSearch?.value) {
      tagSearch.value = '';
      filterTagOptions();
    }
  }

  for (const control of controls) {
    if (control.dataset.archiveFilterKind === 'tag') {
      control.addEventListener('change', () => {
        const state = readState();
        const value = control.dataset.archiveFilterValue || '';
        const checked = (control as HTMLInputElement).checked;
        state.tags = checked ? [...new Set([...state.tags, value])] : state.tags.filter((tag) => tag !== value);
        writeStateToUrl(state, 'push');
        applyState(state);
      });
      continue;
    }

    control.addEventListener('click', () => {
      const state = readState();
      const kind = control.dataset.archiveFilterKind as 'category' | 'difficulty';
      state[kind] = control.dataset.archiveFilterValue || '';
      writeStateToUrl(state, 'push');
      applyState(state);
    });
  }

  activeList?.addEventListener('click', (event) => {
    const chip = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-archive-remove-kind]');
    if (!chip) return;
    const state = readState();
    const kind = chip.dataset.archiveRemoveKind as FilterKind;
    const value = chip.dataset.archiveRemoveValue || '';
    if (kind === 'tag') state.tags = state.tags.filter((tag) => tag !== value);
    else state[kind] = '';
    writeStateToUrl(state, 'push');
    applyState(state);
  });

  clearButton?.addEventListener('click', () => {
    const state: FilterState = { category: '', tags: [], difficulty: '' };
    writeStateToUrl(state, 'push');
    applyState(state);
  });

  tagToggle?.addEventListener('click', () => setTagPanel(tagToggle.getAttribute('aria-expanded') !== 'true'));
  tagSearch?.addEventListener('input', filterTagOptions);

  document.addEventListener('pointerdown', (event) => {
    if (tagToggle?.getAttribute('aria-expanded') === 'true' && !tagSelect?.contains(event.target as Node)) setTagPanel(false);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && tagToggle?.getAttribute('aria-expanded') === 'true') {
      setTagPanel(false);
      tagToggle.focus();
    }
  });

  window.addEventListener('popstate', () => applyState(readState()));
  applyState(readState());
  root.hidden = false;
}

for (const root of document.querySelectorAll<HTMLElement>('[data-archive-filter-root]')) setupArchiveFilters(root);

export {};
