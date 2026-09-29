import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackDownload } from './analytics';
import { SeasonalBackdrop, useSeason } from './seasonal';

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
        const res = await fetch('/api/healthz', { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok && !cancelled) {
          setReady('ready');
          return;
        }
      } catch {
        /* server still waking */
      }

      if (!cancelled) timer = setTimeout(check, 3000);
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
        transition={{ duration: 0.45, ease: 'easeOut' }}
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
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
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
          Starting server
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>

        <p className="text-sm text-muted-foreground max-w-xs">
          The server is waking up — this usually takes 20–30 seconds. Hang tight!
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
      href="https://ko-fi.com/pinmeapp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      className="relative flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform duration-200"
    >
      {/* Steam */}
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

      {/* Coffee cup */}
      <span className="relative z-10 text-3xl leading-none">
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

// ─── Main app ────────────────────────────────────────────────────────────────

export default function App({
  onOpenPrivacy,
  onOpenTerms,
  onOpenHowItWorks,
  onSplashComplete,
}: {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenHowItWorks: () => void;
  onSplashComplete?: () => void;
}) {
  const serverReady = useServerReady();
  const season = useSeason();

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
    setProgressLabel('Fetching video info...');
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

        throw new Error(
          data.error ||
            'Something went wrong. Please check your connection and try again.'
        );
      }

      let downloadTriggered = false;

      for await (const event of readSSE(response)) {
        if (event.type === 'stage') {
          setProgressLabel(event.label);
        } else if (event.type === 'ready') {
          setProgressLabel('Starting download...');

          const a = document.createElement('a');

          a.href = `https://pinme-api-server.onrender.com/api/stream/${event.token}`;

          a.download =
            event.filename || 'pinterest-video.mp4';

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
          throw new Error(event.message);
        }
      }

      if (!downloadTriggered) {
        throw new Error('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');

      setErrorMsg(
        err.message ||
          'Something went wrong. Please check your connection and try again.'
      );
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
          <header className="sticky top-0 z-50 flex items-center gap-2 p-6 justify-center sm:justify-start bg-background">
            <img
              src="/header-logo.png"
              alt="pinME Logo"
              className="h-10 w-10 object-contain"
            />

            <span className="text-2xl font-bold tracking-tight">
              <span className="text-foreground">pin</span>
              <span className="text-primary">ME</span>
            </span>
          </header>

          {/* Main Content */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
            <div className="w-full space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Download Pinterest videos, images, GIFs &amp; carousels
                </h1>

                <p className="text-muted-foreground text-sm">
                  Fast, free, and directly to your device.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="w-full space-y-4"
              >
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onPaste={handleNativePaste}
                    placeholder="Paste Pinterest link here..."
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

                <div className="pt-2 min-h-[72px] flex justify-center items-center w-full">
                  {status === 'loading' ? (
                    <ProgressLabel label={progressLabel} />
                  ) : status === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full py-4 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold text-center flex items-center justify-center gap-2 px-3"
                      data-testid="status-success"
                    >
                      <span className="text-sm sm:text-base">
                        {successInfo.mediaType === 'carousel'
                          ? `Carousel downloaded as ZIP${
                              successInfo.imageCount
                                ? ` (${successInfo.imageCount} images)`
                                : ''
                            }`
                          : successInfo.mediaType === 'image'
                            ? 'Image downloaded'
                            : 'Video downloaded'}
                      </span>

                      <span className="text-lg leading-none">✓</span>
                    </motion.div>
                  ) : (
                    <button
                      type="submit"
                      disabled={!url.trim()}
                      className={`w-full ${
                        season === 'default'
                          ? 'bg-primary hover:bg-primary/90 disabled:hover:bg-primary'
                          : `seasonal-button seasonal-button-${season}`
                      } disabled:opacity-50 text-primary-foreground py-4 rounded-xl font-semibold text-lg transition-colors shadow-[0_0_20px_rgba(230,0,35,0.2)]`}
                      data-testid="button-submit"
                    >
                      Download Now
                    </button>
                  )}
                </div>
              </form>

              <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
                Your download will be saved to your device&apos;s Downloads folder (and usually appears in your Gallery/Photos app automatically).
              </p>

              {/* Coffee button */}
              <div className="flex justify-center pt-1">
                <CoffeeButton />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-0 pb-16 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="hover:text-foreground transition-colors"
              >
                How It Works &amp; FAQ
              </button>

              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </button>

              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-foreground transition-colors"
              >
                Terms &amp; Conditions
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