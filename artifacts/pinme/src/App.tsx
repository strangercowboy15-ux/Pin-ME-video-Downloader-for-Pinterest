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

// ─── Download travel animation ───────────────────────────────────────────────

function DownloadTravelAnimation() {
  return (
    <div
      className="relative w-[140px] h-[48px] mx-auto pointer-events-none"
      aria-hidden="true"
    >
      {/* Motion trail */}
      <motion.div
        initial={{
          x: -42,
          opacity: 0,
          scaleX: 0.2,
        }}
        animate={{
          x: 8,
          opacity: [0, 0.45, 0],
          scaleX: [0.2, 1, 0.5],
        }}
        transition={{
          duration: 0.55,
          ease: 'easeOut',
        }}
        className="absolute left-1/2 top-[24px] w-12 h-[2px] -translate-x-1/2 rounded-full bg-primary/50 origin-left"
      />

      {/* File */}
      <motion.div
        initial={{
          x: -48,
          y: 0,
          scale: 0.65,
          opacity: 0,
        }}
        animate={{
          x: 25,
          y: -1,
          scale: [0.65, 1, 0.85],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.62,
          ease: 'easeOut',
        }}
        className="absolute left-1/2 top-[8px] z-20"
      >
        <div className="relative w-7 h-8 rounded-md bg-background border border-primary/70 shadow-md flex items-center justify-center">
          {/* Fold */}
          <div className="absolute top-0.5 right-0.5 w-2 h-2 border-l border-b border-primary/60 rounded-bl-sm" />

          {/* File lines */}
          <div className="flex flex-col gap-1">
            <div className="w-3 h-[2px] rounded-full bg-primary/80" />
            <div className="w-3 h-[2px] rounded-full bg-primary/40" />
          </div>
        </div>
      </motion.div>

      {/* Phone */}
      <motion.div
        initial={{
          x: 42,
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          x: 0,
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.35,
          delay: 0.12,
          ease: 'easeOut',
        }}
        className="absolute left-1/2 top-[2px] z-10"
      >
        <div className="relative w-9 h-12 rounded-[9px] border-2 border-foreground/60 bg-background shadow-md flex items-center justify-center">
          {/* Screen */}
          <div className="w-5 h-7 rounded-sm border border-border bg-primary/5" />

          {/* Download arrow */}
          <motion.div
            initial={{
              y: -4,
              opacity: 0,
            }}
            animate={{
              y: [-4, 3, 0],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.48,
              delay: 0.48,
              ease: 'easeOut',
            }}
            className="absolute"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Impact ring */}
      <motion.div
        initial={{
          x: 32,
          scale: 0.3,
          opacity: 0,
        }}
        animate={{
          x: 32,
          scale: [0.3, 1.15],
          opacity: [0, 0.45, 0],
        }}
        transition={{
          duration: 0.42,
          delay: 0.58,
          ease: 'easeOut',
        }}
        className="absolute left-1/2 top-[10px] w-9 h-9 rounded-full border border-primary/60"
      />

      {/* Tiny particles */}
      <motion.span
        initial={{
          x: 26,
          y: 22,
          opacity: 0,
          scale: 0,
        }}
        animate={{
          x: [26, 18, 34],
          y: [22, 12, 30],
          opacity: [0, 0.7, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: 0.5,
          delay: 0.6,
          ease: 'easeOut',
        }}
        className="absolute left-1/2 top-0 w-1.5 h-1.5 rounded-full bg-primary"
      />

      <motion.span
        initial={{
          x: 31,
          y: 24,
          opacity: 0,
          scale: 0,
        }}
        animate={{
          x: [31, 40, 24],
          y: [24, 17, 34],
          opacity: [0, 0.55, 0],
          scale: [0, 0.8, 0],
        }}
        transition={{
          duration: 0.48,
          delay: 0.64,
          ease: 'easeOut',
        }}
        className="absolute left-1/2 top-0 w-1 h-1 rounded-full bg-primary/70"
      />
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

  // Media type is initially unknown.
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

    // Do not assume every Pinterest link is a video.
    setProgressLabel('Checking media type...');

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
          // Backend decides the correct media-specific message.
          setProgressLabel(event.label);
        } else if (event.type === 'ready') {
          setProgressLabel('Starting download...');

          const a = document.createElement('a');

          a.href = `https://pinme-api-server.onrender.com/api/stream/${event.token}`;

          a.download =
            event.filename || 'pinterest-download';

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

              {/* Balanced heading */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-balance max-w-[360px] mx-auto">
                  Download Pinterest videos, images, GIFs &amp; carousels
                </h1>

                <p className="text-muted-foreground text-sm max-w-[320px] mx-auto">
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

                {/* Download / Success area */}
                <div className="pt-2 min-h-[72px] flex justify-center items-center w-full">
                  <AnimatePresence mode="wait">
                    {status === 'loading' ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <ProgressLabel
                          label={progressLabel || 'Checking media type...'}
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
                        {/* Animation ABOVE the success box */}
                        <div className="h-[48px] w-full flex items-center justify-center overflow-visible">
                          <DownloadTravelAnimation />
                        </div>

                        {/* Success message */}
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.62,
                            duration: 0.22,
                          }}
                          className="w-full py-4 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold text-center flex items-center justify-center gap-2 px-3"
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

                          <span className="text-lg leading-none">
                            ✓
                          </span>
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
                        Download Now
                      </motion.button>
                    )}
                  </AnimatePresence>
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