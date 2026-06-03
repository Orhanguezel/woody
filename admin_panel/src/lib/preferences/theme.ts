// src/lib/preferences/theme.ts

export const THEME_MODE_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

export const THEME_MODE_VALUES = THEME_MODE_OPTIONS.map((o) => o.value);
export type ThemeMode = (typeof THEME_MODE_VALUES)[number];

// --- generated:themePresets:start ---

export const THEME_PRESET_OPTIONS = [
  {
    label: "Orman",
    value: "default",
    primary: {
      light: "var(--logo-coral)",
      dark: "var(--logo-coral-medium)",
    },
  },
  {
    label: "Brutalist",
    value: "brutalist",
    primary: {
      light: "oklch(0.6489 0.237 26.9728)",
      dark: "oklch(0.7044 0.1872 23.1858)",
    },
  },
  {
    label: "Lavanta",
    value: "lavanta",
    primary: {
      light: "oklch(0.55 0.18 300)",
      dark: "oklch(0.72 0.15 300)",
    },
  },
  {
    label: "Okyanus",
    value: "okyanus",
    primary: {
      light: "oklch(0.58 0.13 215.5)",
      dark: "oklch(0.7 0.12 210)",
    },
  },
  {
    label: "Soft Pop",
    value: "soft-pop",
    primary: {
      light: "oklch(0.5106 0.2301 276.9656)",
      dark: "oklch(0.6801 0.1583 276.9349)",
    },
  },
  {
    label: "Tangerine",
    value: "tangerine",
    primary: {
      light: "oklch(0.64 0.17 36.44)",
      dark: "oklch(0.64 0.17 36.44)",
    },
  },
  {
    label: "Woody Akademi",
    value: "woody-akademi",
    primary: {
      light: "oklch(0.36 0.105 252)",
      dark: "oklch(0.72 0.15 250)",
    },
  },
  {
    label: "Woody Güneş",
    value: "woody-gunes",
    primary: {
      light: "oklch(0.75 0.19 47)",
      dark: "oklch(0.8 0.17 47)",
    },
  },
  {
    label: "Woody Klasik",
    value: "woody-klasik",
    primary: {
      light: "oklch(0.646 0.174 250)",
      dark: "oklch(0.72 0.15 250)",
    },
  },
  {
    label: "Woody Neşe",
    value: "woody-nese",
    primary: {
      light: "oklch(0.63 0.21 328)",
      dark: "oklch(0.7 0.19 328)",
    },
  },
] as const;

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value);

export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]["value"];

// --- generated:themePresets:end ---
