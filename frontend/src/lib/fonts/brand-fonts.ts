import { Fredoka, IBM_Plex_Mono, Inter, Source_Serif_4 } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const fontDisplay = Fredoka({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fredoka',
  display: 'swap',
  weight: ['500', '600', '700'],
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const fontSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-source-serif',
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  preload: false,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ibm-mono',
  display: 'swap',
  weight: ['400', '500'],
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
});

export const brandFontVariableClassName =
  `${fontSans.variable} ${fontDisplay.variable} ${fontSerif.variable} ${fontMono.variable}`.trim();
