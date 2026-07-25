---
import { Icon } from 'astro-icon/components';

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: Heading[];
  position: 'center' | 'side';
}

const { headings, position } = Astro.props;
const filtered = headings
  .filter((heading) => heading.depth >= 2 && heading.depth <= 4)
  .map((heading) => ({ ...heading, text: heading.text.replace(/#$/, '').trim() }));
const indent = (depth: number) => `padding-left: ${(depth - 2) * 0.85 + 0.5}rem`;
---

{filtered.length > 0 && (position === 'center' ? (
  <aside id="toc-container" data-position="center" class="pointer-events-none fixed inset-x-0 top-20 z-30 px-4">
    <div class="pointer-events-auto relative mx-auto w-fit">
      <button
        id="toc-center-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="toc-center-dropdown"
        class="flex max-w-[min(22rem,calc(100vw-2rem))] items-center gap-2 rounded-full border border-border bg-popover/90 px-4 py-1.5 text-sm text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-primary"
      >
        <Icon name="lucide:list" class="h-4 w-4 shrink-0" />
        <span id="toc-center-title" class="truncate">{filtered[0]?.text}</span>
        <Icon name="lucide:chevron-down" class="toc-chevron h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
      <nav
        id="toc-center-dropdown"
        class="toc-dropdown absolute left-1/2 top-full mt-2 max-h-[60vh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-[var(--radius-panel)] border border-border bg-popover p-2 text-left shadow-xl"
      >
        {filtered.map((heading) => (
          <a
            href={`#${heading.slug}`}
            data-toc-link
            class="block truncate rounded-[var(--radius-control)] px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            style={indent(heading.depth)}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  </aside>
) : (
  <aside id="toc-container" data-position="side" class="fixed top-24 right-4 z-30 hidden xl:block">
    <div class="group relative flex items-center justify-end">
      <div id="toc-side-indicator" class="flex flex-col items-end gap-1 transition-opacity duration-150 group-hover:pointer-events-none group-hover:opacity-0">
        {filtered.map((heading) => (
          <a href={`#${heading.slug}`} data-toc-link class="toc-bar block h-1 rounded-l-full bg-muted transition-all hover:bg-primary" style={`width: ${Math.max(0.4, 1.15 - (heading.depth - 2) * 0.22)}rem`} aria-label={heading.text}></a>
        ))}
      </div>
      <nav id="toc-side-dropdown" class="absolute right-0 top-0 hidden max-h-[70vh] w-64 overflow-auto rounded-[var(--radius-panel)] border border-border bg-popover p-2 text-sm shadow-xl group-hover:block">
        {filtered.map((heading) => (
          <a href={`#${heading.slug}`} data-toc-link class="block rounded-[var(--radius-control)] px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" style={indent(heading.depth)}>
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  </aside>
))}
