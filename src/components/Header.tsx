import React from 'react';
import {Moon, ShieldCheck, Sun} from 'lucide-react';

type HeaderProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export default function Header({theme, onToggleTheme}: HeaderProps) {
  return (
    <header
      className={`fixed top-0 w-full z-50 backdrop-blur-xl shadow-sm border-b border-outline-variant/10 ${
        theme === 'dark' ? 'bg-surface-container-lowest/80' : 'bg-white/80'
      }`}
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
            <ShieldCheck size={24} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <h1 className="font-headline font-extrabold tracking-tight text-lg text-primary">
              2FAGO
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">
              动态验证码
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95"
            onClick={onToggleTheme}
            type="button"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
