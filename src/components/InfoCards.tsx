import React from 'react';
import {History, ShieldCheck} from 'lucide-react';

export default function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface-container-low rounded-xl p-6 flex items-start gap-4 border border-outline-variant/5">
        <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary shadow-sm">
          <History size={24} />
        </div>
        <div>
          <h4 className="font-bold text-on-surface">本地 TOTP 引擎</h4>
          <p className="text-sm text-on-surface-variant">
            验证码在本地 Base32 + TOTP 逻辑生成.
          </p>
        </div>
      </div>
      <div className="bg-surface-container-low rounded-xl p-6 flex items-start gap-4 border border-outline-variant/5">
        <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-on-surface-variant shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="font-bold text-on-surface">安全提示</h4>
          <p className="text-sm text-on-surface-variant">
            不要把密钥或验证码分享给不可信的人。
          </p>
        </div>
      </div>
    </div>
  );
}
