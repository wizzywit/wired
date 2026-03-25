export type CanvasBoardColors = {
  onSurface: string;
  outline: string;
  outlineSoft: string;
  cardBg: string;
  primaryBg: string;
  onPrimary: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  primaryFixed: string;
  onPrimaryFixed: string;
};

export function getCanvasBoardColors(theme: 'light' | 'dark'): CanvasBoardColors {
  return {
    onSurface: theme === 'dark' ? '#f8fafc' : '#191c1d',
    outline: theme === 'dark' ? '#94a3b8' : '#737687',
    outlineSoft: theme === 'dark' ? '#475569' : '#c3c5d8',
    cardBg: theme === 'dark' ? '#f8fafc' : '#ffffff',
    primaryBg: '#2962ff',
    onPrimary: '#ffffff',
    secondaryFixed: '#ffe170',
    onSecondaryFixed: '#221b00',
    primaryFixed: '#dce1ff',
    onPrimaryFixed: '#001550',
  };
}
