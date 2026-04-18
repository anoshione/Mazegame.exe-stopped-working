import React, { useState } from 'react';
import { Palette, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWebHaptics } from 'web-haptics/react';
import { ThemeId } from '../utils/themes';

export const THEMES: { id: ThemeId; color: string }[] = [
  { id: 'slate', color: 'bg-slate-500' },
  { id: 'orange', color: 'bg-[#f97316]' },
  { id: 'rose', color: 'bg-rose-500' },
  { id: 'emerald', color: 'bg-emerald-500' },
];

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  isDark: boolean;
  onToggleDark: () => void;
  hapticsEnabled?: boolean;
}

export function ThemeSelector({ currentTheme, onSelectTheme, isDark, onToggleDark, hapticsEnabled = true }: ThemeSelectorProps) {
  const haptic = useWebHaptics();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <div 
      className={`flex items-center h-[42px] min-w-[42px] rounded-full pointer-events-auto border-2 transition-all bg-[var(--theme-ui-bg)] border-[var(--theme-player)]`}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (hapticsEnabled) haptic.trigger('selection');
          setIsThemeOpen(!isThemeOpen);
        }}
        className={`w-[38px] h-[38px] flex items-center justify-center shrink-0 text-[var(--theme-player)] hover:opacity-80`}
      >
        <Palette size={20} />
      </motion.button>
      
      <AnimatePresence>
        {isThemeOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center h-full overflow-hidden"
          >
            <div className="flex items-center gap-2 pr-2 pl-3 h-full">
              {THEMES.map((theme, i) => (
                <motion.button
                  key={theme.id}
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('light');
                    onSelectTheme(theme.id);
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: currentTheme === theme.id ? 1.2 : 1 }}
                  exit={{ scale: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className={`w-5 h-5 rounded-full ${theme.color} shadow-sm hover:scale-110 active:scale-95 transition-transform ${
                    currentTheme === theme.id ? 'ring-2 ring-offset-1 ring-[var(--theme-grid)]' : ''
                  }`}
                  style={currentTheme === theme.id && isDark ? { ringOffsetColor: 'var(--theme-bg)' } : {}}
                />
              ))}
              
              <div className="w-px h-5 bg-[var(--theme-player)] mx-0.5 opacity-50" />
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (hapticsEnabled) haptic.trigger('light');
                  onToggleDark();
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ delay: THEMES.length * 0.04, duration: 0.2 }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--theme-player)] hover:opacity-80 hover:bg-[var(--theme-ui-hover)] transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
