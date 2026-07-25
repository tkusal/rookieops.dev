const progress = document.querySelector<HTMLElement>('[data-reading-progress]');

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max <= 0 ? 0 : (window.scrollY / max) * 100;
  const clamped = Math.min(100, Math.max(0, value));
  progress.style.setProperty('--reading-progress', `${clamped}%`);
}

updateProgress();
document.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
