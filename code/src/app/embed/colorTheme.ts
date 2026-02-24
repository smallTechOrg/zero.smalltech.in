/**
 * Enterprise Chat Widget Color Theme System
 * Derives a complete color palette from a single base color
 */

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primarySubtle: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  userMessage: string;
  botMessage: string;
  userMessageText: string;
  botMessageText: string;
}

/**
 * Convert hex color to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Determine if a color is light or dark
 */
function isLightColor(hex: string): boolean {
  const hsl = hexToHSL(hex);
  return hsl.l > 50;
}

/**
 * Generate a complete color palette from a single base color
 */
export function generateColorPalette(baseColor: string): ColorPalette {
  // Ensure hex format
  if (!baseColor.startsWith('#')) {
    baseColor = '#' + baseColor;
  }

  const { h, s, l } = hexToHSL(baseColor);
  const isLight = isLightColor(baseColor);

  // Generate palette
  return {
    // Primary colors
    primary: baseColor,
    primaryLight: hslToHex(h, Math.max(s - 10, 20), Math.min(l + 15, 90)),
    primaryDark: hslToHex(h, Math.min(s + 10, 100), Math.max(l - 15, 10)),
    primarySubtle: hslToHex(h, Math.max(s - 30, 10), Math.min(l + 35, 96)),
    
    // Surface colors
    surface: '#ffffff',
    surfaceHover: '#f8f9fa',
    
    // Text colors
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    
    // UI elements
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.08)',
    
    // Message bubbles
    userMessage: baseColor,
    botMessage: hslToHex(h, Math.max(s - 30, 10), Math.min(l + 35, 96)),
    userMessageText: isLight ? '#1a1a1a' : '#ffffff',
    botMessageText: '#1a1a1a',
  };
}

/**
 * Apply color palette to CSS variables
 */
export function applyColorPalette(palette: ColorPalette): void {
  const root = document.documentElement;
  
  root.style.setProperty('--chat-primary', palette.primary);
  root.style.setProperty('--chat-primary-light', palette.primaryLight);
  root.style.setProperty('--chat-primary-dark', palette.primaryDark);
  root.style.setProperty('--chat-primary-subtle', palette.primarySubtle);
  root.style.setProperty('--chat-surface', palette.surface);
  root.style.setProperty('--chat-surface-hover', palette.surfaceHover);
  root.style.setProperty('--chat-text', palette.text);
  root.style.setProperty('--chat-text-secondary', palette.textSecondary);
  root.style.setProperty('--chat-border', palette.border);
  root.style.setProperty('--chat-shadow', palette.shadow);
  root.style.setProperty('--chat-user-message', palette.userMessage);
  root.style.setProperty('--chat-bot-message', palette.botMessage);
  root.style.setProperty('--chat-user-message-text', palette.userMessageText);
  root.style.setProperty('--chat-bot-message-text', palette.botMessageText);
}

/**
 * Get color from URL parameter or use default
 */
export function getThemeColor(searchParams: URLSearchParams): string {
  return searchParams.get('color') || '#4F46E5'; // Default: Indigo
}
