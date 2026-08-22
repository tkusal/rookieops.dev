let observer: IntersectionObserver | undefined;

function initToc() {
  if (observer) observer.disconnect();

  const toc = document.getElementById('toc-container');
  if (!toc) return;

  const links = [...toc.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
  const title = document.getElementById('toc-center-title');
  const dropdown = document.getElementById('toc-center-dropdown');
  const toggle = document.getElementById('toc-center-toggle');

  const headingId = (link: HTMLAnchorElement) => decodeURIComponent(link.hash.slice(1));
  const headings = links
    .map((link) => document.getElementById(headingId(link)))
    .filter(Boolean) as HTMLElement[];

  function setActive(id: string) {
    links.forEach((link) => {
      const active = headingId(link) === id;
      link.classList.toggle('toc-active', active);
      if (active && title && link.textContent) title.textContent = link.textContent;
    });
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible[0]?.target.id) setActive(visible[0].target.id);
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] }
  );
  headings.forEach((heading) => observer?.observe(heading));

  if (toggle && dropdown) {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isOpen = () => dropdown.classList.contains('is-open');
    const close = () => {
      dropdown.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      dropdown.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      isOpen() ? close() : open();
    });
    if (canHover) {
      toc.addEventListener('mouseenter', open);
      toc.addEventListener('mouseleave', close);
    }
    links.forEach((link) => link.addEventListener('click', close));

    // Cleanup old global listeners by not attaching them multiple times
    // We can use a trick: attach them to the 'toc' element instead if possible,
    // or rely on the global click listener handling it by checking existence.
  }
}

document.addEventListener('astro:page-load', initToc);
document.addEventListener('astro:before-swap', () => observer?.disconnect());

// Global listeners for TOC dropdown that survive transitions
document.addEventListener('click', (event) => {
  const toc = document.getElementById('toc-container');
  const dropdown = document.getElementById('toc-center-dropdown');
  if (toc && dropdown?.classList.contains('is-open') && !toc.contains(event.target as Node)) {
    dropdown.classList.remove('is-open');
    document.getElementById('toc-center-toggle')?.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  const dropdown = document.getElementById('toc-center-dropdown');
  if (event.key === 'Escape' && dropdown?.classList.contains('is-open')) {
    dropdown.classList.remove('is-open');
    document.getElementById('toc-center-toggle')?.setAttribute('aria-expanded', 'false');
  }
});
