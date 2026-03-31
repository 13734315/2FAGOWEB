import React, {useEffect, useRef, useState} from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';

const PERIOD = 30;
const DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const THEME_STORAGE_KEY = '2fago-theme';
const STATUS_ALERT_DURATION_MS = 3000;

type Theme = 'light' | 'dark';
type StatusTone = 'default' | 'error' | 'alert';

function extractSecret() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const querySecret = new URLSearchParams(window.location.search).get('secret');

  if (querySecret) {
    return decodeURIComponent(querySecret);
  }

  if (parts.length === 0) {
    return '';
  }

  if (parts[0].toLowerCase() === '2fago') {
    return decodeURIComponent(parts.slice(1).join(''));
  }

  return decodeURIComponent(parts[parts.length - 1]);
}

function normalizeSecret(secret: string) {
  return secret
    .replace(/^(秘钥-|密钥-)/i, '')
    .toUpperCase()
    .replace(/[\s-]+/g, '')
    .replace(/=+$/g, '')
    .replace(/[^A-Z2-7]/g, '');
}

function getRoutingBase() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0]?.toLowerCase() === '2fago' ? '/2fago/' : '/';
}

function buildDisplaySecretUrl(secret: string) {
  const base = getRoutingBase();
  return window.location.origin + (secret ? base + secret : base);
}

function buildHistorySecretUrl(secret: string) {
  const base = getRoutingBase();
  return secret ? base + secret : base;
}

function isValidSecret(secret: string) {
  return normalizeSecret(secret).length >= 6;
}

function getSuccessStatusText(secret: string) {
  return `${secret.slice(0, 5)}-验证码正在本地生成，并将在当前周期结束后自动刷新。`;
}

function decodeBase32(secret: string) {
  let bits = '';
  const bytes: number[] = [];

  for (const char of secret) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error('密钥不是有效的 Base32 格式');
    }
    bits += value.toString(2).padStart(5, '0');
  }

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return new Uint8Array(bytes);
}

function formatCode(code: string) {
  return code.replace(/(\d{3})(\d{3})/, '$1 $2');
}

async function generateTotp(secret: string, timestampMs: number) {
  if (!window.crypto?.subtle) {
    throw new Error('当前浏览器不支持 Web Crypto');
  }

  const secretBytes = decodeBase32(secret);
  if (secretBytes.length === 0) {
    throw new Error('密钥不能为空');
  }

  const counter = Math.floor(timestampMs / 1000 / PERIOD);
  const counterBytes = new Uint8Array(8);
  const counterView = new DataView(counterBytes.buffer);
  counterView.setUint32(0, Math.floor(counter / 0x100000000), false);
  counterView.setUint32(4, counter >>> 0, false);

  const key = await window.crypto.subtle.importKey(
    'raw',
    secretBytes,
    {name: 'HMAC', hash: 'SHA-1'},
    false,
    ['sign'],
  );

  const signature = new Uint8Array(
    await window.crypto.subtle.sign('HMAC', key, counterBytes),
  );

  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

async function copyText(text: string) {
  if (window.navigator?.clipboard?.writeText) {
    await window.navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default function App() {
  const initialRawSecret = extractSecret();
  const [theme, setTheme] = useState<Theme>('light');
  const [secretInput, setSecretInput] = useState('');
  const [currentRawSecret, setCurrentRawSecret] = useState(initialRawSecret);
  const [currentOtp, setCurrentOtp] = useState('');
  const [displayCode, setDisplayCode] = useState('------');
  const [statusText, setStatusText] = useState(
    '请输入密钥，或直接访问专属链接以查看当前验证码。',
  );
  const [statusTone, setStatusTone] = useState<StatusTone>('default');
  const [copyCodeLabel, setCopyCodeLabel] = useState('复制验证码');
  const [copyUrlLabel, setCopyUrlLabel] = useState('复制链接');
  const [now, setNow] = useState(Date.now());
  const copyCodeResetRef = useRef<number | null>(null);
  const copyUrlResetRef = useRef<number | null>(null);
  const statusResetRef = useRef<number | null>(null);

  const currentSecond = Math.floor(now / 1000);
  const counter = Math.floor(currentSecond / PERIOD);
  const secondsLeft = PERIOD - (currentSecond % PERIOD);
  const progress = (secondsLeft / PERIOD) * 100;
  const normalizedCurrentSecret = normalizeSecret(currentRawSecret);
  const currentUrl = buildDisplaySecretUrl(secretInput || currentRawSecret);
  const exampleUrl = buildDisplaySecretUrl('KKKKKKKKKKKK');

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handlePopState = () => {
      const nextRawSecret = extractSecret();
      setCurrentRawSecret(nextRawSecret);
      setSecretInput('');
      setNow(Date.now());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!currentRawSecret) {
      setDisplayCode('------');
      setCurrentOtp('');
      setStatusText('请输入密钥，或直接访问专属链接以查看当前验证码。');
      setStatusTone('default');
      return () => {
        cancelled = true;
      };
    }

    if (!isValidSecret(currentRawSecret)) {
      setDisplayCode('------');
      setCurrentOtp('');
      setStatusText('密钥值无效');
      setStatusTone('error');
      return () => {
        cancelled = true;
      };
    }

    generateTotp(normalizedCurrentSecret, now)
      .then((otp) => {
        if (cancelled) {
          return;
        }
        setCurrentOtp(otp);
        setDisplayCode(formatCode(otp));
        setStatusText(getSuccessStatusText(normalizedCurrentSecret));
        setStatusTone('default');
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }
        setCurrentOtp('');
        setDisplayCode('ERROR');
        setStatusText(error.message || '验证码生成失败');
        setStatusTone('error');
      });

    return () => {
      cancelled = true;
    };
  }, [currentRawSecret, normalizedCurrentSecret, counter]);

  useEffect(() => {
    return () => {
      if (copyCodeResetRef.current) {
        window.clearTimeout(copyCodeResetRef.current);
      }
      if (copyUrlResetRef.current) {
        window.clearTimeout(copyUrlResetRef.current);
      }
      if (statusResetRef.current) {
        window.clearTimeout(statusResetRef.current);
      }
    };
  }, []);

  function flashCopyCodeLabel(nextLabel: string) {
    setCopyCodeLabel(nextLabel);
    if (copyCodeResetRef.current) {
      window.clearTimeout(copyCodeResetRef.current);
    }
    copyCodeResetRef.current = window.setTimeout(() => {
      setCopyCodeLabel('复制验证码');
    }, 1400);
  }

  function flashCopyUrlLabel(nextLabel: string) {
    setCopyUrlLabel(nextLabel);
    if (copyUrlResetRef.current) {
      window.clearTimeout(copyUrlResetRef.current);
    }
    copyUrlResetRef.current = window.setTimeout(() => {
      setCopyUrlLabel('复制链接');
    }, 1400);
  }

  function handleSecretSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextUrl = buildHistorySecretUrl(secretInput);
    window.history.pushState({}, '', nextUrl);
    setCurrentRawSecret(secretInput);
    setNow(Date.now());
  }

  async function handleCodeCopy() {
    if (!currentOtp) {
      flashCopyCodeLabel('暂无验证码');
      return;
    }

    try {
      await copyText(currentOtp);
      flashCopyCodeLabel('已复制');
    } catch {
      flashCopyCodeLabel('复制失败');
    }
  }

  async function handleUrlCopy() {
    try {
      await copyText(window.location.href);
      flashCopyUrlLabel('已复制');
    } catch {
      flashCopyUrlLabel('复制失败');
    }
  }

  async function handleCodeClick() {
    if (!currentOtp) {
      return;
    }

    try {
      await copyText(currentOtp);
      setStatusText('验证码已复制到剪贴板。');
      setStatusTone('alert');
      if (statusResetRef.current) {
        window.clearTimeout(statusResetRef.current);
      }
      statusResetRef.current = window.setTimeout(() => {
        if (!currentRawSecret) {
          setStatusText('请输入密钥，或直接访问专属链接以查看当前验证码。');
          setStatusTone('default');
          return;
        }

        if (!isValidSecret(currentRawSecret)) {
          setStatusText('密钥值无效');
          setStatusTone('error');
          return;
        }

        setStatusText(getSuccessStatusText(normalizedCurrentSecret));
        setStatusTone('default');
      }, STATUS_ALERT_DURATION_MS);
    } catch {
      setStatusText('复制验证码失败，请稍后重试。');
      setStatusTone('error');
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto lg:flex gap-10 min-h-screen">
        <MainContent
          code={displayCode}
          statusText={statusText}
          statusTone={statusTone}
          timeLeft={secondsLeft}
          progress={progress}
          copyCodeLabel={copyCodeLabel}
          copyUrlLabel={copyUrlLabel}
          onCopyCode={handleCodeCopy}
          onCopyUrl={handleUrlCopy}
          onCodeClick={handleCodeClick}
        />
        <Sidebar
          secretInput={secretInput}
          currentUrl={currentUrl}
          exampleUrl={exampleUrl}
          onSecretChange={setSecretInput}
          onSubmit={handleSecretSubmit}
        />
      </main>
    </div>
  );
}
