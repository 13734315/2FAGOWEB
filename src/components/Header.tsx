import React from 'react';
import {Menu, Moon, Settings, ShieldCheck, Sun} from 'lucide-react';

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
              Authenticator Pro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-6">
            <a className="text-primary font-semibold text-sm" href="#">
              Generator
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
              href="#secret-panel"
            >
              Security Keys
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
              href="#guide-panel"
            >
              Guide
            </a>
          </nav>

          <button
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95"
            onClick={onToggleTheme}
            type="button"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95" type="button" aria-label="设置">
            <Settings size={20} />
          </button>
          <button className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95" type="button" aria-label="菜单">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
