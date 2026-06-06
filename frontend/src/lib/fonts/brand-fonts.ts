import { Baloo_2, Fredoka, IBM_Plex_Mono, Inter, Quicksand, Source_Serif_4 } from 'next/font/google';

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

export const fontQuicksand = Quicksand({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-quicksand',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const fontBaloo = Baloo_2({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-baloo',
  display: 'swap',
  weight: ['700', '800'],
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const brandFontVariableClassName =
  `${fontSans.variable} ${fontDisplay.variable} ${fontSerif.variable} ${fontMono.variable} ${fontQuicksand.variable} ${fontBaloo.variable}`.trim();
