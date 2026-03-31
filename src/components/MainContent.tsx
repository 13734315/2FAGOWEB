import React from 'react';
import {Copy, History, Laptop, Link as LinkIcon} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';

type MainContentProps = {
  code: string;
  statusText: string;
  statusTone: 'default' | 'error' | 'alert';
  timeLeft: number;
  progress: number;
  copyCodeLabel: string;
  copyUrlLabel: string;
  onCopyCode: () => void;
  onCopyUrl: () => void;
  onCodeClick: () => void;
};

export default function MainContent({
  code,
  statusText,
  statusTone,
  timeLeft,
  progress,
  copyCodeLabel,
  copyUrlLabel,
  onCopyCode,
  onCopyUrl,
  onCodeClick,
}: MainContentProps) {
  const statusClassName =
    statusTone === 'error'
      ? 'text-sm md:text-base text-red-500'
      : statusTone === 'alert'
        ? 'text-sm md:text-base text-emerald-600'
        : 'text-sm md:text-base text-on-surface-variant';

  return (
    <section className="flex-1 space-y-8">
      <div className="bg-surface-container-lowest rounded-xl p-10 lg:p-16 flex flex-col items-center justify-center text-center space-y-10 shadow-sm border border-outline-variant/5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Active Session
          </span>
          <h2 className="text-on-surface-variant font-medium">
            Dynamic Verification Code
          </h2>
        </div>

        <div className="relative h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.button
              key={code}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{duration: 0.3}}
              className="text-[5rem] md:text-[7rem] font-headline font-extrabold tracking-tighter text-on-surface leading-none select-all cursor-pointer hover:text-primary transition-colors bg-transparent border-0 p-0"
              onClick={onCodeClick}
              type="button"
            >
              {code}
            </motion.button>
          </AnimatePresence>
        </div>

        <p className={statusClassName}>{statusText}</p>

        <div className="w-full max-w-md space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant">
              Generation Cycle
            </span>
            <span className="text-sm font-semibold text-primary font-headline">
              {timeLeft}s remaining
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{width: '100%'}}
              animate={{width: `${progress}%`}}
              transition={{duration: 1, ease: 'linear'}}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-4">
          <button
            className="flex items-center justify-center gap-2 bg-primary text-on-primary py-4 px-6 rounded-xl font-semibold hover:bg-primary-dim transition-all active:scale-[0.98] shadow-sm group"
            onClick={onCopyCode}
            type="button"
          >
            <Copy size={20} className="group-hover:scale-110 transition-transform" />
            {copyCodeLabel}
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container py-4 px-6 rounded-xl font-semibold hover:bg-surface-container-high transition-all active:scale-[0.98] group"
            onClick={onCopyUrl}
            type="button"
          >
            <LinkIcon size={20} className="group-hover:rotate-12 transition-transform" />
            {copyUrlLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low rounded-xl p-6 flex items-start gap-4 border border-outline-variant/5">
          <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary shadow-sm">
            <History size={24} />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Local TOTP Engine</h4>
            <p className="text-sm text-on-surface-variant">
              验证码完全在浏览器本地生成，沿用我们原来的 Base32 + TOTP 逻辑。
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-6 flex items-start gap-4 border border-outline-variant/5">
          <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-on-surface-variant shadow-sm">
            <Laptop size={24} />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Direct Link Access</h4>
            <p className="text-sm text-on-surface-variant">
              输入密钥后会生成你的专属链接，后续直接访问链接就能继续查看当前验证码。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
