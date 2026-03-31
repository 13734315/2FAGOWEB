import React from 'react';
import {ExternalLink, Globe} from 'lucide-react';

type SidebarProps = {
  secretInput: string;
  currentUrl: string;
  exampleUrl: string;
  onSecretChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function Sidebar({
  secretInput,
  currentUrl,
  exampleUrl,
  onSecretChange,
  onSubmit,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-96 mt-10 lg:mt-0 space-y-6">
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm" id="secret-panel">
        <h3 className="font-headline font-bold text-on-surface mb-4">输入密钥打开</h3>
        <form className="space-y-4" onSubmit={onSubmit} id="secret-form">
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Base32 Secret Key
            </label>
            <input
              className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 transition-all font-mono text-on-surface outline-none"
              placeholder="JBSWY3DPEHPK3PXP"
              type="text"
              value={secretInput}
              onChange={(event) => onSecretChange(event.target.value)}
              inputMode="latin"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              id="secret-input"
            />
          </div>
          <button className="w-full py-3 bg-on-surface text-surface-container-lowest rounded-lg font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2" type="submit">
            <ExternalLink size={16} />
            打开链接
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-outline-variant/10">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Current Context URL
          </label>
          <div className="bg-surface-container-low p-3 rounded-lg flex items-center gap-2 overflow-hidden">
            <Globe size={14} className="text-outline-variant shrink-0" />
            <code className="text-[10px] text-on-surface-variant truncate" id="target-url">
              {currentUrl}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm" id="guide-panel">
        <h3 className="font-headline font-bold text-on-surface mb-4">使用方式</h3>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              1
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              粘贴你的 Base32 密钥，页面会立即按我们自己的逻辑计算动态验证码。
            </p>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              2
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              6 位验证码会每 30 秒自动刷新，并且当前链接会对应这组密钥。
            </p>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              3
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              点击复制验证码或复制链接，就可以把它用到你的目标系统里。
            </p>
          </li>
        </ul>
        <div className="mt-6 pt-6 border-t border-outline-variant/10">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Example URL
          </label>
          <div className="bg-surface-container-low p-3 rounded-lg flex items-center gap-2 overflow-hidden">
            <Globe size={14} className="text-outline-variant shrink-0" />
            <code className="text-[10px] text-on-surface-variant truncate" id="example-url">
              {exampleUrl}
            </code>
          </div>
        </div>
      </div>
    </aside>
  );
}
