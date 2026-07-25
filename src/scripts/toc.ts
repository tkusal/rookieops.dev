const toc = document.getElementById('toc-container');

if (toc) {
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

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible[0]?.target.id) setActive(visible[0].target.id);
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] }
  );
  headings.forEach((heading) => observer.observe(heading));

  // Center mode: hover opens on pointer devices; click remains for touch and keyboard use.
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
    document.addEventListener('click', (event) => {
      if (isOpen() && !toc.contains(event.target as Node)) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) close();
    });
  }
}
