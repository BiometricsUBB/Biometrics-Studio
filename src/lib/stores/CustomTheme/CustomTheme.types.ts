export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
}

export interface CustomTheme {
    id: string;
    name: string;
    baseTheme: "light" | "dark";
    colors: ThemeColors;
    createdAt: number;
    updatedAt: number;
}

const PRIMARY_COLOR = "124 41% 56%";

export const DEFAULT_LIGHT_COLORS: ThemeColors = {
    primary: PRIMARY_COLOR,
    secondary: "124 35% 80%",
    background: "124 50% 95%",
    foreground: "124 25% 35%",
    card: "124 46.44% 86.6%",
    cardForeground: "120 31.03% 5.69%",
    popover: "124 65% 83%",
    popoverForeground: "124 33% 43%",
    muted: "124 26.94% 83.15%",
    mutedForeground: "120 2.85% 35.9%",
    accent: "159 51.92% 74.94%",
    accentForeground: "159 33% 10.66%",
    border: "124 31.17% 37.73%",
    input: "124 17.99% 69.36%",
    ring: "124 28% 56%",
    destructive: "12.78 83.18% 37.23%",
    destructiveForeground: "120 22.5% 90.41%",
};

export const DEFAULT_DARK_COLORS: ThemeColors = {
    primary: PRIMARY_COLOR,
    secondary: "124 41% 15.12%",
    background: "124 26.65% 4.48%",
    foreground: "124 31% 84.66%",
    card: "124 38.35% 7.28%",
    cardForeground: "124 31% 97.8%",
    popover: "124 39.15% 14.56%",
    popoverForeground: "124 31% 97.8%",
    muted: "124 40% 11.72%",
    mutedForeground: "124 10.46% 57.62%",
    accent: "159 46.27% 21.21%",
    accentForeground: "159 31% 97.8%",
    border: "124 14.72% 34.42%",
    input: "124 14.72% 34.42%",
    ring: PRIMARY_COLOR,
    destructive: "12.78 48.06% 59.52%",
    destructiveForeground: "120 3.45% 5.69%",
};

export const THEME_COLOR_LABELS: Record<keyof ThemeColors, string> = {
    primary: "Primary",
    secondary: "Secondary",
    background: "Background",
    foreground: "Foreground",
    card: "Card",
    cardForeground: "Card Foreground",
    popover: "Popover",
    popoverForeground: "Popover Foreground",
    muted: "Muted",
    mutedForeground: "Muted Foreground",
    accent: "Accent",
    accentForeground: "Accent Foreground",
    border: "Border",
    input: "Input",
    ring: "Ring",
    destructive: "Destructive",
    destructiveForeground: "Destructive Foreground",
};

export function generateThemeId(): string {
    return `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createDefaultTheme(baseTheme: "light" | "dark"): CustomTheme {
    const now = Date.now();
    return {
        id: generateThemeId(),
        name: baseTheme === "light" ? "New Light Theme" : "New Dark Theme",
        baseTheme,
        colors:
            baseTheme === "light"
                ? { ...DEFAULT_LIGHT_COLORS }
                : { ...DEFAULT_DARK_COLORS },
        createdAt: now,
        updatedAt: now,
    };
}
