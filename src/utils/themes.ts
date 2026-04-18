export type ThemeId = 'slate' | 'orange' | 'rose' | 'emerald';

export interface ThemeColors {
  bg: string;
  mazeBg: string;
  grid: string;
  textMain: string;
  textMuted: string;
  player: string;
  playerShadow: string;
  trail: string;
  goal: string;
  goalShadow: string;
  uiBg: string;
  uiBorder: string;
  uiHover: string;
}

export const getThemeColors = (id: ThemeId, isDark: boolean): ThemeColors => {
  const palettes: Record<ThemeId, { light: ThemeColors; dark: ThemeColors }> = {
    slate: {
      light: {
        bg: '#f8fafc',
        mazeBg: '#f8fafc',
        grid: '#e2e8f0',
        textMain: '#0f172a',
        textMuted: '#64748b',
        player: '#94a3b8',
        playerShadow: 'rgba(148,163,184,0.5)',
        trail: 'rgba(148,163,184,0.3)',
        goal: '#60a5fa',
        goalShadow: 'rgba(96,165,250,0.6)',
        uiBg: 'rgba(255,255,255,0.6)',
        uiBorder: '#cbd5e1',
        uiHover: 'rgba(255,255,255,0.8)',
      },
      dark: {
        bg: '#171717',
        mazeBg: '#171717',
        grid: '#404040',
        textMain: '#f5f5f5',
        textMuted: '#a3a3a3',
        player: '#a3a3a3',
        playerShadow: 'rgba(163,163,163,0.5)',
        trail: 'rgba(163,163,163,0.3)',
        goal: '#60a5fa',
        goalShadow: 'rgba(96,165,250,0.6)',
        uiBg: 'rgba(23,23,23,0.6)',
        uiBorder: '#525252',
        uiHover: 'rgba(23,23,23,0.8)',
      }
    },
    orange: {
      light: {
        bg: '#fcfaf8',
        mazeBg: '#fcfaf8',
        grid: '#e8e4df',
        textMain: '#292624',
        textMuted: '#78716c',
        player: '#fb923c',
        playerShadow: 'rgba(251,146,60,0.5)',
        trail: 'rgba(251,146,60,0.3)',
        goal: '#facc15',
        goalShadow: 'rgba(250,204,21,0.6)',
        uiBg: 'rgba(255,255,255,0.6)',
        uiBorder: '#d6d1cc',
        uiHover: 'rgba(255,255,255,0.8)',
      },
      dark: {
        bg: '#1c1917',
        mazeBg: '#1c1917',
        grid: '#443f3c',
        textMain: '#fafaf9',
        textMuted: '#a8a29e',
        player: '#fb923c',
        playerShadow: 'rgba(251,146,60,0.5)',
        trail: 'rgba(251,146,60,0.3)',
        goal: '#facc15',
        goalShadow: 'rgba(250,204,21,0.6)',
        uiBg: 'rgba(28,25,23,0.6)',
        uiBorder: '#57534e',
        uiHover: 'rgba(28,25,23,0.8)',
      }
    },
    rose: {
      light: {
        bg: '#fcf8f9',
        mazeBg: '#fcf8f9',
        grid: '#e8dfe1',
        textMain: '#292425',
        textMuted: '#786c6e',
        player: '#fb7185',
        playerShadow: 'rgba(251,113,133,0.5)',
        trail: 'rgba(251,113,133,0.3)',
        goal: '#c084fc',
        goalShadow: 'rgba(192,132,252,0.6)',
        uiBg: 'rgba(255,255,255,0.6)',
        uiBorder: '#d6ccd0',
        uiHover: 'rgba(255,255,255,0.8)',
      },
      dark: {
        bg: '#1c1718',
        mazeBg: '#1c1718',
        grid: '#443c3e',
        textMain: '#faf9fa',
        textMuted: '#a89ea0',
        player: '#fb7185',
        playerShadow: 'rgba(251,113,133,0.5)',
        trail: 'rgba(251,113,133,0.3)',
        goal: '#c084fc',
        goalShadow: 'rgba(192,132,252,0.6)',
        uiBg: 'rgba(28,23,24,0.6)',
        uiBorder: '#574e51',
        uiHover: 'rgba(28,23,24,0.8)',
      }
    },
    emerald: {
      light: {
        bg: '#f8fcf9',
        mazeBg: '#f8fcf9',
        grid: '#dfe8e1',
        textMain: '#242926',
        textMuted: '#6c7871',
        player: '#34d399',
        playerShadow: 'rgba(52,211,153,0.5)',
        trail: 'rgba(52,211,153,0.3)',
        goal: '#22d3ee',
        goalShadow: 'rgba(34,211,238,0.6)',
        uiBg: 'rgba(255,255,255,0.6)',
        uiBorder: '#ccd6d0',
        uiHover: 'rgba(255,255,255,0.8)',
      },
      dark: {
        bg: '#171c19',
        mazeBg: '#171c19',
        grid: '#3c443f',
        textMain: '#f9faf9',
        textMuted: '#9ea8a2',
        player: '#34d399',
        playerShadow: 'rgba(52,211,153,0.5)',
        trail: 'rgba(52,211,153,0.3)',
        goal: '#22d3ee',
        goalShadow: 'rgba(34,211,238,0.6)',
        uiBg: 'rgba(23,28,25,0.6)',
        uiBorder: '#4e5753',
        uiHover: 'rgba(23,28,25,0.8)',
      }
    }
  };

  return palettes[id][isDark ? 'dark' : 'light'];
};
