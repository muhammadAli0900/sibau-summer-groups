export const PROGRAM_COLORS: Record<string, string> = {
  'BSCS': '#7c9eb5',
  'BSSE': '#9b8ec4',
  'BBA': '#7ab5a0',
  'BSAF': '#c9a96e',
  'BE-CSE': '#c47a7a',
  'BE-EE': '#6ab0b0',
  'BSMath': '#c49bc4',
  'BED': '#7ab5c4',
  'BSMC': '#c4a07a',
  'BSCS-OLD': '#8a9e8a',
}

export function getProgramColor(code: string, fallback: string): string {
  return PROGRAM_COLORS[code] ?? fallback
}
