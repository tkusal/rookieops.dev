export const themes = [{ id: 'rookieops', name: 'RookieOps' }] as const;

export type ThemeId = (typeof themes)[number]['id'];

export const defaultTheme: ThemeId = 'rookieops';
