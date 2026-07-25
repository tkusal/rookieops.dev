import { defineEcConfig } from 'astro-expressive-code';

export default defineEcConfig({
  emitExternalStylesheet: false,
  themes: ['github-light', 'github-dark'],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => theme.name === 'github-dark' ? '.dark' : ':root:not(.dark)',
  styleOverrides: {
    borderRadius: 'var(--radius-panel)',
    borderColor: 'var(--color-border)',
    codeFontSize: '0.875rem',
    codePaddingBlock: '1rem',
    codePaddingInline: '1.35rem',
    frames: {
      shadowColor: 'transparent'
    }
  }
});
