import Fuse from 'fuse.js';
import { createDialogController } from './dialog-focus';

type SearchItem = {
  title: string;
  description?: string;
  url: string;
  lang: string;
  type: string;
  tags?: string[];
  categories?: string[];
  content?: string;
};

const modal = document.getElementById('search-modal');
const overlay = document.getElementById('search-overlay');
const input = document.getElementById('search-input') as HTMLInputElement | null;
const closeButton = document.getElementById('search-close');
const empty = document.getElementById('search-empty');
const loading = document.getElementById('search-loading');
const noResults = document.getElementById('search-no-results');
const results = document.getElementById('search-results');
const locale = modal?.dataset.locale || 'pt-br';
const base = import.meta.env.BASE_URL || '/';
let fuse: Fuse<SearchItem> | null = null;
let indexPromise: Promise<SearchItem[]> | null = null;
const dialogController = modal
  ? createDialogController({
      dialog: modal,
      preserve: overlay ? [overlay] : [],
      initialFocus: () => input,
      onEscape: closeSearch
    })
  : null;

function show(element: HTMLElement | null) {
  element?.classList.remove('hidden');
}

function hide(element: HTMLElement | null) {
  element?.classList.add('hidden');
}

export function openSearch() {
  if (!modal || dialogController?.isActive()) return;
  dialogController?.activate();
  modal.classList.remove('pointer-events-none', 'opacity-0', 'scale-95');
  modal.classList.add('opacity-100', 'scale-100');
  overlay?.classList.remove('pointer-events-none', 'opacity-0');
  overlay?.classList.add('opacity-100');
  void ensureIndex();
}

function closeSearch() {
  if (!modal || !dialogController?.isActive()) return;
  modal.classList.add('pointer-events-none', 'opacity-0', 'scale-95');
  modal.classList.remove('opacity-100', 'scale-100');
  overlay?.classList.add('pointer-events-none', 'opacity-0');
  overlay?.classList.remove('opacity-100');
  dialogController.deactivate();
}

async function ensureIndex() {
  if (!indexPromise) {
    hide(empty);
    show(loading);
    indexPromise = fetch(`${base}api/search.json`).then((response) => {
      if (!response.ok)
        throw new Error(`Search index request failed with status ${response.status}.`);
      return response.json();
    });
  }
  const data = await indexPromise;
  if (!fuse) {
    fuse = new Fuse(
      data.filter((item) => item.lang === locale),
      {
        keys: ['title', 'description', 'tags', 'categories', 'content'],
        threshold: 0.35,
        ignoreLocation: true
      }
    );
  }
  hide(loading);
  show(empty);
}

function renderSearch(query: string) {
  if (!results) return;
  results.innerHTML = '';
  hide(empty);
  hide(noResults);

  if (!query.trim()) {
    show(empty);
    return;
  }

  const items = fuse?.search(query).slice(0, 12) || [];
  if (items.length === 0) {
    show(noResults);
    return;
  }

  for (const { item } of items) {
    const link = document.createElement('a');
    link.href = item.url;
    link.className = 'block rounded-md px-3 py-2 hover:bg-accent';
    const title = document.createElement('div');
    title.className = 'font-medium';
    title.textContent = item.title;
    const description = document.createElement('div');
    description.className = 'mt-1 line-clamp-2 text-sm text-muted-foreground';
    description.textContent = item.description || '';
    link.append(title, description);
    results.appendChild(link);
  }
}

closeButton?.addEventListener('click', closeSearch);
overlay?.addEventListener('click', closeSearch);
input?.addEventListener('input', async () => {
  await ensureIndex();
  renderSearch(input.value);
});
