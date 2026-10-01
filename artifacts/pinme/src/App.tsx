import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackDownload } from './analytics';
import { SeasonalBackdrop, useSeason } from './seasonal';
import { useLanguage } from './useLanguage';

// ─── Server-ready hook ───────────────────────────────────────────────────────

function useServerReady() {
  const [ready, setReady] = useState<'checking' | 'ready'>('checking');

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('/api/healthz', {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok && !cancelled) {
          setReady('ready');
          return;
        }
      } catch {
        /* server still waking */
      }

      if (!cancelled) {
        timer = setTimeout(check, 3000);
      }
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return ready;
}

// ─── Splash screen ───────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-5"
    >
      <motion.img
        src="/splash-logo.png"
        alt="pinME"
        className="h-24 w-24 object-contain rounded-3xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.45,
          ease: 'easeOut',
        }}
      />

      <motion.p
        className="text-sm text-muted-foreground tracking-wide"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        pinme.download
      </motion.p>
    </motion.div>
  );
}

// ─── Server-waking screen ────────────────────────────────────────────────────

function WakingScreen() {
  const { t } = useLanguage();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-center gap-6 font-sans px-6">
      <img
        src="/splash-logo.png"
        alt="pinME Logo"
        className="h-20 w-20 object-contain rounded-2xl"
      />

      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">
          {t('serverStarting')}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>

        <p className="text-sm text-muted-foreground max-w-xs">
          {t('serverWakingText')}
        </p>
      </div>

      <div className="h-6 w-6 rounded-full border-2 border-foreground/10 border-t-primary animate-spin" />
    </div>
  );
}

// ─── Progress label shown during loading ─────────────────────────────────────

function ProgressLabel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-muted-foreground text-center"
        >
          {label}
        </motion.p>
      </AnimatePresence>

      <div className="css-spinner" />
    </div>
  );
}

// ─── Cute coffee success animation ───────────────────────────────────────────

function CoffeeDownloadAnimation() {
  return (
    <div
      className="relative w-[110px] h-[74px] mx-auto pointer-events-none overflow-visible"
      aria-hidden="true"
    >
      <motion.div
        initial={{ y: 8, scale: 0.82, opacity: 0 }}
        animate={{
          y: [8, -5, 0, -2, 0],
          scale: [0.82, 1, 1, 1.08, 3.8],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 1.55,
          times: [0, 0.18, 0.38, 0.58, 1],
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center text-4xl leading-none origin-center"
      >
        ☕︎
      </motion.div>

      <motion.span
        initial={{ opacity: 0, y: 8, x: -8, scale: 0.7 }}
        animate={{
          opacity: [0, 0.5, 0.25, 0],
          y: [8, 2, -5, -14],
          x: [-8, -10, -6, -9],
          scale: [0.7, 0.9, 1, 1.1],
        }}
        transition={{ duration: 1.25, delay: 0.12, ease: 'easeOut' }}
        className="absolute left-[38px] top-[7px] text-[11px] leading-none"
      >
        ~
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 8, x: 2, scale: 0.7 }}
        animate={{
          opacity: [0, 0.45, 0.2, 0],
          y: [8, 1, -7, -16],
          x: [2, 5, 1, 4],
          scale: [0.7, 0.9, 1, 1.15],
        }}
        transition={{ duration: 1.35, delay: 0.28, ease: 'easeOut' }}
        className="absolute left-[53px] top-[4px] text-[10px] leading-none"
      >
        ~
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 7, x: 10, scale: 0.65 }}
        animate={{
          opacity: [0, 0.4, 0.18, 0],
          y: [7, 0, -6, -15],
          x: [10, 13, 9, 12],
          scale: [0.65, 0.85, 1, 1.1],
        }}
        transition={{ duration: 1.2, delay: 0.42, ease: 'easeOut' }}
        className="absolute left-[62px] top-[7px] text-[9px] leading-none"
      >
        ~
      </motion.span>
    </div>
  );
}

// ─── SSE stream parser ───────────────────────────────────────────────────────

type SSEEvent =
  | { type: 'stage'; label: string }
  | {
      type: 'ready';
      token: string;
      filename: string;
      title: string | null;
      mediaType?: 'video' | 'image' | 'carousel';
      imageCount?: number;
    }
  | { type: 'error'; message: string };

async function* readSSE(response: Response): AsyncGenerator<SSEEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const line = part.trim();

        if (!line.startsWith('data: ')) continue;

        try {
          yield JSON.parse(line.slice(6)) as SSEEvent;
        } catch {
          /* malformed event — skip */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Coffee button ───────────────────────────────────────────────────────────

function CoffeeButton() {
  return (
    <a
      href="https://ko-fi.com/pinmedownload"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      className="relative flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform duration-200"
    >
      <span className="pointer-events-none absolute left-[18px] top-[2px] text-[10px] leading-none opacity-0 animate-coffee-steam">
        ~
      </span>

      <span
        className="pointer-events-none absolute left-[24px] top-[0px] text-[9px] leading-none opacity-0 animate-coffee-steam"
        style={{ animationDelay: '0.45s' }}
      >
        ~
      </span>

      <span
        className="pointer-events-none absolute left-[29px] top-[3px] text-[8px] leading-none opacity-0 animate-coffee-steam"
        style={{ animationDelay: '0.9s' }}
      >
        ~
      </span>

      <span className="relative z-10 text-3xl leading-none text-[#f87171]">
        ☕︎
      </span>

      <style>{`
        @keyframes coffeeSteam {
          0% {
            opacity: 0;
            transform: translateY(5px);
          }
          25% {
            opacity: 0.45;
          }
          70% {
            opacity: 0.2;
          }
          100% {
            opacity: 0;
            transform: translateY(-9px);
          }
        }

        .animate-coffee-steam {
          animation: coffeeSteam 2.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-coffee-steam {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </a>
  );
}

// ─── Translate backend SSE stages ────────────────────────────────────────────

function getTranslatedStage(
  label: string,
  t: (key: any) => string
): string {
  const normalized = label.trim().toLowerCase();

  switch (normalized) {
    case 'checking media type...':
      return t('checkingMedia');

    case 'fetching video info...':
      return t('fetchingInfo');

    case 'downloading video...':
      return t('downloadingVideo');

    case 'processing video...':
      return t('processingVideo');

    case 'preparing download...':
      return t('preparingDownload');

    case 'starting download...':
      return t('startingDownload');

    default:
      return label;
  }
}

// ─── Main app ────────────────────────────────────────────────────────────────

export default function App({
  onOpenPrivacy,
  onOpenTerms,
  onOpenHowItWorks,
  onSplashComplete,
}: {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenHowItWorks?: () => void;
  onSplashComplete?: () => void;
}) {
  const serverReady = useServerReady();
  const season = useSeason();
  const { t } = useLanguage();

  const [showSplash, setShowSplash] = useState(true);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [progressLabel, setProgressLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    mediaType?: 'video' | 'image' | 'carousel';
    imageCount?: number;
  }>({});

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setShowSplash(false);
      onSplashComplete?.();
    }, 1800);

    return () => clearTimeout(id);
  }, [onSplashComplete]);

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        setUrl(text);
        triggerDownload(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleNativePaste = (
    _e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    setTimeout(() => {
      if (inputRef.current) {
        const value = inputRef.current.value.trim();

        if (value) {
          setUrl(value);
          triggerDownload(value);
        }
      }
    }, 50);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (url.trim()) {
      triggerDownload(url.trim());
    }
  };

  const triggerDownload = async (targetUrl: string) => {
    setStatus('loading');
    setProgressLabel(t('checkingMedia'));
    setErrorMsg('');
    setSuccessInfo({});

    try {
      const response = await fetch(
        'https://pinme-api-server.onrender.com/api/get-pin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: targetUrl,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(data.error || t('errorGeneric'));
      }

      let downloadTriggered = false;

      for await (const event of readSSE(response)) {
        if (event.type === 'stage') {
          setProgressLabel(getTranslatedStage(event.label, t));
        } else if (event.type === 'ready') {
          setProgressLabel(t('startingDownload'));

          const a = document.createElement('a');

          a.href = `https://pinme-api-server.onrender.com/api/stream/${event.token}`;

          a.download = event.filename || 'pinterest-download';

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          trackDownload();

          downloadTriggered = true;

          setSuccessInfo({
            mediaType: event.mediaType,
            imageCount: event.imageCount,
          });

          setStatus('success');

          setTimeout(() => {
            setUrl('');
            setStatus('idle');
            setProgressLabel('');
            setSuccessInfo({});
          }, 3000);
        } else if (event.type === 'error') {
          throw new Error(event.message || t('errorGeneric'));
        }
      }

      if (!downloadTriggered) {
        throw new Error(t('errorGeneric'));
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || t('errorGeneric'));
    }
  };

  // ─── Share Pin-ME ─────────────────────────────────────────────────────────

  const handleShare = async () => {
    const shareUrl = 'https://pinme.download/';

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'pinME Downloader',
          text: 'Fast & simple Pinterest downloader',
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }

      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (clipboardErr) {
        console.error('Failed to share Pin-ME', clipboardErr);
      }
    }
  };

  return (
    <>
      {/* Splash */}
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {/* Server-waking */}
      {!showSplash && serverReady === 'checking' && <WakingScreen />}

      {/* Main UI */}
      {!showSplash && serverReady === 'ready' && (
        <div className="relative min-h-[100dvh] w-full bg-background text-foreground flex flex-col font-sans">
          <SeasonalBackdrop season={season} />

          {/* Header */}
          <header className="sticky top-0 z-50 flex flex-col items-center gap-1 p-6 bg-background">
            <div className="flex items-center gap-2">
              <img
                src="/header-logo.png"
                alt="pinME Logo"
                className="h-10 w-10 object-contain"
              />

              <span className="text-2xl font-bold tracking-tight">
                <span className="text-foreground">pin</span>
                <span className="text-primary">ME</span>
              </span>
            </div>

            <span className="text-[10px] text-muted-foreground tracking-wider">
              v2.1.0
            </span>
          </header>

          {/* Main Content */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
            <div className="w-full space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-balance max-w-[360px] mx-auto">
                  {t('heading')}
                </h1>

                <p className="text-muted-foreground text-sm max-w-[320px] mx-auto">
                  {t('subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onPaste={handleNativePaste}
                    placeholder={t('placeholder')}
                    className="w-full bg-input/50 border border-border rounded-xl py-4 pl-4 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                    disabled={status === 'loading'}
                    data-testid="input-url"
                  />

                  <button
                    type="button"
                    onClick={handlePasteClick}
                    className="absolute right-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Paste from clipboard"
                    disabled={status === 'loading'}
                    data-testid="button-paste"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect
                        x="5.5"
                        y="1.5"
                        width="12"
                        height="12"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />

                      <rect
                        x="1.5"
                        y="6.5"
                        width="12"
                        height="12"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="var(--color-surface, #1e1e1e)"
                      />
                    </svg>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center"
                      data-testid="status-error"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 min-h-[92px] flex justify-center items-center w-full">
                  <AnimatePresence mode="wait">
                    {status === 'loading' ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <ProgressLabel
                          label={progressLabel || t('checkingMedia')}
                        />
                      </motion.div>
                    ) : status === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full flex flex-col items-center"
                        data-testid="status-success"
                      >
                        <div className="h-[74px] w-full flex items-center justify-center overflow-visible">
                          <CoffeeDownloadAnimation />
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.05, duration: 0.22 }}
                          className="w-full py-4 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold text-center flex items-center justify-center gap-2 px-3"
                        >
                          <span className="text-sm sm:text-base">
                            {successInfo.mediaType === 'carousel'
                              ? `${t('carouselDownloaded')}${
                                  successInfo.imageCount
                                    ? ` (${successInfo.imageCount} ${t(
                                        'imagesCount'
                                      )})`
                                    : ''
                                }`
                              : successInfo.mediaType === 'image'
                                ? t('imageDownloaded')
                                : t('videoDownloaded')}
                          </span>

                          <span className="text-lg leading-none">✓</span>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="download"
                        type="submit"
                        disabled={!url.trim()}
                        className={`w-full ${
                          season === 'default'
                            ? 'bg-primary hover:bg-primary/90 disabled:hover:bg-primary'
                            : `seasonal-button seasonal-button-${season}`
                        } disabled:opacity-50 text-primary-foreground py-4 rounded-xl font-semibold text-lg transition-colors shadow-[0_0_20px_rgba(230,0,35,0.2)]`}
                        data-testid="button-submit"
                      >
                        {t('downloadNow')}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
                {t('infoText')}
              </p>

              <div className="flex justify-center pt-1">
                <CoffeeButton />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-0 pb-16 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              {/* How It Works & FAQ */}
              <button
                type="button"
                onClick={() => {
                  window.location.hash = 'how-it-works';
                  onOpenHowItWorks?.();
                }}
                className="hover:text-foreground transition-colors"
              >
                {t('howItWorksHomeFooter')}
              </button>

              {/* Privacy Policy */}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-foreground transition-colors"
              >
                {t('privacyPolicy')}
              </button>

              {/* Terms & Conditions */}
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-foreground transition-colors"
              >
                {t('termsConditions')}
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share Pin-ME"
                title="Share Pin-ME"
                className="text-red-500 hover:text-red-400 hover:scale-110 transition-all duration-200 text-3xl leading-none"
              >
                ➦
              </button>
            </div>
          </footer>

          {/* Badge-blend gradient */}
          <div
            aria-hidden="true"
            className="badge-blend fixed bottom-0 right-0 pointer-events-none"
            style={{
              width: 220,
              height: 100,
            }}
          />
        </div>
      )}
    </>
  );
}