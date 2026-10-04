import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackDownload } from './analytics';
import { SeasonalBackdrop, useSeason } from './seasonal';
import { useLanguage } from './useLanguage';

// ─── API ─────────────────────────────────────────────────────────────────────

const API_BASE =
  'https://pinme-api-server.onrender.com';

const GET_PIN_URL =
  `${API_BASE}/api/get-pin`;

const STREAM_URL =
  `${API_BASE}/api/stream`;

// ─── Pinterest URL check ─────────────────────────────────────────────────────

function isPinterestUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host === 'pin.it' ||
      host === 'pinterest.com' ||
      host.endsWith('.pinterest.com') ||
      host.endsWith('.pinterest.ca') ||
      host.endsWith('.pinterest.co.uk') ||
      host.endsWith('.pinterest.fr') ||
      host.endsWith('.pinterest.de') ||
      host.endsWith('.pinterest.it') ||
      host.endsWith('.pinterest.es') ||
      host.endsWith('.pinterest.se') ||
      host.endsWith('.pinterest.pt') ||
      host.endsWith('.pinterest.nz') ||
      host.endsWith('.pinterest.at') ||
      host.endsWith('.pinterest.mx') ||
      host.endsWith('.pinterest.jp')
    );
  } catch {
    return false;
  }
}

// ─── Sound effect for invalid link ───────────────────────────────────────────

function playInvalidSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext =
      new AudioContextClass();

    const oscillator =
      audioContext.createOscillator();

    const gainNode =
      audioContext.createGain();

    oscillator.connect(gainNode);

    gainNode.connect(
      audioContext.destination
    );

    oscillator.type = 'sine';

    oscillator.frequency.setValueAtTime(
      800,
      audioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      400,
      audioContext.currentTime + 0.15
    );

    gainNode.gain.setValueAtTime(
      0.15,
      audioContext.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.2
    );

    oscillator.start(
      audioContext.currentTime
    );

    oscillator.stop(
      audioContext.currentTime + 0.2
    );

    setTimeout(() => {
      audioContext.close();
    }, 300);
  } catch {
    /* Audio not supported — silent fallback */
  }
}

// ─── Server-ready hook ───────────────────────────────────────────────────────

function useServerReady() {
  const [ready, setReady] =
    useState<'checking' | 'ready'>('checking');

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const controller =
          new AbortController();

        const timeout = setTimeout(
          () => controller.abort(),
          6000
        );

        const res = await fetch(
          '/api/healthz',
          {
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (
          res.ok &&
          !cancelled
        ) {
          setReady('ready');
          return;
        }
      } catch {
        /* server still waking */
      }

      if (!cancelled) {
        timer = setTimeout(
          check,
          3000
        );
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
        initial={{
          scale: 0.85,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.45,
          ease: 'easeOut',
        }}
      />

      <motion.p
        className="text-sm text-muted-foreground tracking-wide"
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.2,
        }}
      >
        pinme.download
      </motion.p>
    </motion.div>
  );
}

// ─── Server-waking screen ────────────────────────────────────────────────────

function WakingScreen() {
  const { t } =
    useLanguage();

  const [dots, setDots] =
    useState('');

  useEffect(() => {
    const id =
      setInterval(() => {
        setDots((d) =>
          d.length >= 3
            ? ''
            : d + '.'
        );
      }, 500);

    return () =>
      clearInterval(id);
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
          <span className="inline-block w-6 text-left">
            {dots}
          </span>
        </p>

        <p className="text-sm text-muted-foreground max-w-xs">
          {t('serverWakingText')}
        </p>
      </div>

      <div className="h-6 w-6 rounded-full border-2 border-foreground/10 border-t-primary animate-spin" />
    </div>
  );
}

// ─── Animated bouncing dots ──────────────────────────────────────────────────

function AnimatedStageLabel({
  label,
}: {
  label: string;
}) {
  const hasTrailingDots =
    /\.{3}$/.test(label);

  if (!hasTrailingDots) {
    return <>{label}</>;
  }

  const baseLabel =
    label.replace(
      /\.{3}$/,
      ''
    );

  return (
    <>
      {baseLabel}

      <span
        aria-hidden="true"
        className="inline-flex items-end ml-1"
        style={{
          gap: '2px',
          verticalAlign:
            'baseline',
        }}
      >
        <span className="animate-bounce-dot">
          •
        </span>

        <span
          className="animate-bounce-dot"
          style={{
            animationDelay:
              '0.15s',
          }}
        >
          •
        </span>

        <span
          className="animate-bounce-dot"
          style={{
            animationDelay:
              '0.3s',
          }}
        >
          •
        </span>

        <style>{`
          @keyframes bounceDot {
            0%,
            60%,
            100% {
              transform: translateY(0);
            }

            30% {
              transform: translateY(-4px);
            }
          }

          .animate-bounce-dot {
            display: inline-block;
            animation: bounceDot 0.9s ease-in-out infinite;
            font-size: 0.9em;
            line-height: 1;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-bounce-dot {
              animation: none;
            }
          }
        `}</style>
      </span>
    </>
  );
}

// ─── Circular progress indicator (WITH INNER COLOR GLOW) ─────────────────────

function ProgressLabel({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  const radius = 34;

  const circumference =
    2 * Math.PI * radius;

  const clampedProgress =
    Math.min(
      100,
      Math.max(0, progress)
    );

  const strokeDashoffset =
    circumference *
    (1 -
      clampedProgress / 100);

  const progressColor =
    clampedProgress <= 30
      ? '#ef4444'
      : clampedProgress <= 70
        ? '#eab308'
        : '#22c55e';

  const isComplete =
    clampedProgress === 100;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -4,
          }}
          transition={{
            duration: 0.2,
          }}
          className="text-sm text-muted-foreground text-center"
        >
          <AnimatedStageLabel
            label={label}
          />
        </motion.p>
      </AnimatePresence>

      <motion.div
        className="relative flex items-center justify-center w-20 h-20"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          clampedProgress
        }
        aria-label={`${clampedProgress}%`}
        animate={
          isComplete
            ? {
                scale: [
                  1,
                  1.06,
                  1,
                ],
              }
            : {
                scale: 1,
              }
        }
        transition={
          isComplete
            ? {
                duration: 0.45,
                ease: 'easeOut',
              }
            : {
                duration: 0.2,
              }
        }
      >
        {/*
         * Inner glow pulse — center-only.
         * Red → Yellow → Green based on progress.
         * Stays INSIDE the ring.
         */}
        <motion.div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: '60%',
            height: '60%',
            background: `radial-gradient(circle, ${progressColor} 0%, ${progressColor}80 40%, transparent 75%)`,
            filter: 'blur(4px)',
          }}
          animate={{
            scale: [
              0.7,
              1.1,
              0.7,
            ],
            opacity: [
              0.35,
              0.85,
              0.35,
            ],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/*
         * Stronger inner flash — quick double-pulse
         * also stays INSIDE the ring.
         */}
        <motion.div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '40%',
            background: `radial-gradient(circle, ${progressColor} 0%, transparent 70%)`,
            filter: 'blur(3px)',
          }}
          animate={{
            scale: [
              0.5,
              1.3,
              0.5,
            ],
            opacity: [
              0,
              0.9,
              0,
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Progress ring */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="absolute inset-0"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-muted/30"
          />

          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="5"
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            strokeDasharray={
              circumference
            }
            initial={{
              strokeDashoffset:
                circumference,
            }}
            animate={{
              strokeDashoffset,
            }}
            transition={{
              duration: 0.45,
              ease: 'easeOut',
            }}
          />

          {isComplete && (
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="5"
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              strokeDasharray={
                circumference
              }
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: [
                  0,
                  0.35,
                  0,
                ],
              }}
              transition={{
                duration: 0.45,
                ease: 'easeOut',
              }}
            />
          )}
        </svg>

        {/* Percentage text (on top) */}
        <motion.span
          key={clampedProgress}
          initial={{
            opacity: 0.5,
            scale: 0.9,
          }}
          animate={
            isComplete
              ? {
                  opacity: [
                    0.5,
                    1,
                    1,
                  ],
                  scale: [
                    0.9,
                    1.08,
                    1,
                  ],
                }
              : {
                  opacity: 1,
                  scale: 1,
                }
          }
          transition={{
            duration:
              isComplete
                ? 0.45
                : 0.2,
          }}
          className="relative z-10 text-sm font-semibold text-foreground"
        >
          {clampedProgress}%
        </motion.span>
      </motion.div>
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
        initial={{
          y: 8,
          scale: 0.82,
          opacity: 0,
        }}
        animate={{
          y: [
            8,
            -5,
            0,
            -2,
            0,
          ],
          scale: [
            0.82,
            1,
            1,
            1.08,
            3.8,
          ],
          opacity: [
            0,
            1,
            1,
            1,
            0,
          ],
        }}
        transition={{
          duration: 1.55,
          times: [
            0,
            0.18,
            0.38,
            0.58,
            1,
          ],
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center text-4xl leading-none origin-center"
      >
        ☕︎
      </motion.div>

      <motion.span
        initial={{
          opacity: 0,
          y: 8,
          x: -8,
          scale: 0.7,
        }}
        animate={{
          opacity: [
            0,
            0.5,
            0.25,
            0,
          ],
          y: [
            8,
            2,
            -5,
            -14,
          ],
          x: [
            -8,
            -10,
            -6,
            -9,
          ],
          scale: [
            0.7,
            0.9,
            1,
            1.1,
          ],
        }}
        transition={{
          duration: 1.25,
          delay: 0.12,
          ease: 'easeOut',
        }}
        className="absolute left-[38px] top-[7px] text-[11px] leading-none"
      >
        ~
      </motion.span>

      <motion.span
        initial={{
          opacity: 0,
          y: 8,
          x: 2,
          scale: 0.7,
        }}
        animate={{
          opacity: [
            0,
            0.45,
            0.2,
            0,
          ],
          y: [
            8,
            1,
            -7,
            -16,
          ],
          x: [
            2,
            5,
            1,
            4,
          ],
          scale: [
            0.7,
            0.9,
            1,
            1.15,
          ],
        }}
        transition={{
          duration: 1.35,
          delay: 0.28,
          ease: 'easeOut',
        }}
        className="absolute left-[53px] top-[4px] text-[10px] leading-none"
      >
        ~
      </motion.span>

      <motion.span
        initial={{
          opacity: 0,
          y: 7,
          x: 10,
          scale: 0.65,
        }}
        animate={{
          opacity: [
            0,
            0.4,
            0.18,
            0,
          ],
          y: [
            7,
            0,
            -6,
            -15,
          ],
          x: [
            10,
            13,
            9,
            12,
          ],
          scale: [
            0.65,
            0.85,
            1,
            1.1,
          ],
        }}
        transition={{
          duration: 1.2,
          delay: 0.42,
          ease: 'easeOut',
        }}
        className="absolute left-[62px] top-[7px] text-[9px] leading-none"
      >
        ~
      </motion.span>
    </div>
  );
}

// ─── SSE stream parser ───────────────────────────────────────────────────────

type SSEEvent =
  | {
      type: 'stage';
      label: string;
    }
  | {
      type: 'ready';
      token: string;
      filename: string;
      title: string | null;
      mediaType?:
        | 'video'
        | 'image'
        | 'carousel';
      imageCount?: number;
      imageFormat?: string;
    }
  | {
      type: 'error';
      message: string;
    };

async function* readSSE(
  response: Response
): AsyncGenerator<SSEEvent> {
  if (!response.body) {
    throw new Error(
      'Empty server response'
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = '';

  try {
    while (true) {
      const {
        done,
        value,
      } =
        await reader.read();

      if (done) break;

      buffer += decoder.decode(
        value,
        {
          stream: true,
        }
      );

      const parts =
        buffer.split('\n\n');

      buffer =
        parts.pop() ?? '';

      for (const part of parts) {
        const line =
          part.trim();

        if (
          !line.startsWith(
            'data: '
          )
        ) {
          continue;
        }

        try {
          yield JSON.parse(
            line.slice(6)
          ) as SSEEvent;
        } catch {
          /* malformed event — skip */
        }
      }
    }

    if (buffer.trim()) {
      const line =
        buffer.trim();

      if (
        line.startsWith(
          'data: '
        )
      ) {
        try {
          yield JSON.parse(
            line.slice(6)
          ) as SSEEvent;
        } catch {
          /* malformed final event */
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
        style={{
          animationDelay:
            '0.45s',
        }}
      >
        ~
      </span>

      <span
        className="pointer-events-none absolute left-[29px] top-[3px] text-[8px] leading-none opacity-0 animate-coffee-steam"
        style={{
          animationDelay:
            '0.9s',
        }}
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
  const normalized =
    label.trim().toLowerCase();

  switch (normalized) {
    case 'checking media type...':
      return t('checkingMedia');

    case 'fetching video info...':
      return t(
        'fetchingVideoInfo'
      );

    case 'fetching image info...':
      return t(
        'fetchingImageInfo'
      );

    case 'fetching carousel info...':
      return t(
        'fetchingCarouselInfo'
      );

    case 'fetching gif info...':
      return t(
        'fetchingGifInfo'
      );

    case 'fetching info...':
      return t(
        'fetchingInfo'
      );

    case 'downloading video...':
      return t(
        'downloadingVideo'
      );

    case 'downloading image...':
      return t(
        'downloadingImage'
      );

    case 'downloading gif...':
      return t(
        'downloadingGif'
      );

    case 'downloading carousel...':
      return t(
        'downloadingCarousel'
      );

    case 'processing video...':
      return t(
        'processingVideo'
      );

    case 'converting image to svg...':
      return t(
        'convertingImageSvg'
      );

    case 'converting image to png...':
      return t(
        'convertingImagePng'
      );

    case 'converting carousel to svg...':
      return t(
        'convertingCarouselSvg'
      );

    case 'converting carousel to png...':
      return t(
        'convertingCarouselPng'
      );

    case 'packaging carousel...':
      return t(
        'packagingCarousel'
      );

    case 'preparing download...':
      return t(
        'preparingDownload'
      );

    case 'starting download...':
      return t(
        'startingDownload'
      );

    default:
      return label;
  }
}

// ─── Progress percentage ─────────────────────────────────────────────────────

function getProgressFromStage(
  label: string
): number {
  const normalized =
    label.trim().toLowerCase();

  switch (normalized) {
    case 'checking media type...':
      return 10;

    case 'fetching video info...':
    case 'fetching image info...':
    case 'fetching carousel info...':
    case 'fetching gif info...':
    case 'fetching info...':
      return 25;

    case 'downloading video...':
    case 'downloading image...':
    case 'downloading gif...':
    case 'downloading carousel...':
      return 50;

    case 'processing video...':
    case 'converting image to svg...':
    case 'converting image to png...':
    case 'converting carousel to svg...':
    case 'converting carousel to png...':
    case 'packaging carousel...':
      return 75;

    case 'preparing download...':
      return 90;

    case 'starting download...':
      return 95;

    default:
      return 10;
  }
}

// ─── Success message ─────────────────────────────────────────────────────────

function getSuccessMessage(
  successInfo: {
    mediaType?:
      | 'video'
      | 'image'
      | 'carousel';
    imageCount?: number;
    filename?: string;
  },
  t: (key: any) => string
): string {
  const filename =
    successInfo.filename
      ?.toLowerCase() ?? '';

  const isGif =
    filename.endsWith('.gif');

  const isZip =
    filename.endsWith('.zip');

  if (
    successInfo.mediaType ===
      'carousel' ||
    isZip
  ) {
    const count =
      successInfo.imageCount &&
      successInfo.imageCount > 0
        ? ` (${successInfo.imageCount} ${t(
            'imagesCount'
          )})`
        : '';

    return `${t(
      'carouselDownloaded'
    )}${count} • ZIP`;
  }

  if (
    successInfo.mediaType ===
      'image' &&
    isGif
  ) {
    return 'GIF downloaded';
  }

  if (isGif) {
    return 'GIF downloaded';
  }

  if (
    successInfo.mediaType ===
    'image'
  ) {
    return t(
      'imageDownloaded'
    );
  }

  if (
    successInfo.mediaType ===
    'video'
  ) {
    return t(
      'videoDownloaded'
    );
  }

  if (
    filename.endsWith('.mp4') ||
    filename.endsWith('.webm') ||
    filename.endsWith('.mov') ||
    filename.endsWith('.mkv')
  ) {
    return t(
      'videoDownloaded'
    );
  }

  return t(
    'imageDownloaded'
  );
}

// ─── Download helper ─────────────────────────────────────────────────────────

async function downloadStreamFile(
  token: string,
  filename: string,
  mediaType?: 
    | 'video'
    | 'image'
    | 'carousel'
): Promise<void> {
  const streamUrl =
    `${STREAM_URL}/${encodeURIComponent(
      token
    )}`;

  if (
    mediaType === 'carousel' ||
    filename
      .toLowerCase()
      .endsWith('.zip')
  ) {
    const response =
      await fetch(
        streamUrl,
        {
          method: 'GET',
          credentials: 'omit',
        }
      );

    if (!response.ok) {
      throw new Error(
        `Carousel download failed (${response.status})`
      );
    }

    const blob =
      await response.blob();

    if (
      blob.size === 0
    ) {
      throw new Error(
        'The carousel ZIP is empty.'
      );
    }

    const firstBytes =
      await blob
        .slice(0, 4)
        .arrayBuffer();

    const bytes =
      new Uint8Array(
        firstBytes
      );

    const looksLikeZip =
      bytes.length >= 2 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b;

    if (!looksLikeZip) {
      throw new Error(
        'Carousel server returned a non-ZIP file. The carousel ZIP must be created on the server.'
      );
    }

    const objectUrl =
      URL.createObjectURL(
        blob
      );

    try {
      const a =
        document.createElement(
          'a'
        );

      a.href =
        objectUrl;

      a.download =
        filename ||
        'pinterest-carousel.zip';

      document.body.appendChild(
        a
      );

      a.click();

      a.remove();
    } finally {
      setTimeout(
        () =>
          URL.revokeObjectURL(
            objectUrl
          ),
        1000
      );
    }

    return;
  }

  const a =
    document.createElement(
      'a'
    );

  a.href =
    streamUrl;

  a.download =
    filename ||
    'pinterest-download';

  a.rel =
    'noopener';

  document.body.appendChild(
    a
  );

  a.click();

  a.remove();
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
  const serverReady =
    useServerReady();

  const season =
    useSeason();

  const { t } =
    useLanguage();

  const [showSplash, setShowSplash] =
    useState(true);

  const [url, setUrl] =
    useState('');

  const [
    displayUrl,
    setDisplayUrl,
  ] = useState('');

  const [status, setStatus] =
    useState<
      | 'idle'
      | 'loading'
      | 'success'
      | 'error'
    >('idle');

  const [
    progressLabel,
    setProgressLabel,
  ] = useState('');

  const [progress, setProgress] =
    useState(10);

  const [errorMsg, setErrorMsg] =
    useState('');

  const [
    successInfo,
    setSuccessInfo,
  ] = useState<{
    mediaType?:
      | 'video'
      | 'image'
      | 'carousel';
    imageCount?: number;
    filename?: string;
  }>({});

  const [
    isLinkFading,
    setIsLinkFading,
  ] = useState(false);

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const downloadInProgress =
    useRef(false);

  const resetTimerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  useEffect(() => {
    const id =
      setTimeout(() => {
        setShowSplash(false);
        onSplashComplete?.();
      }, 1800);

    return () =>
      clearTimeout(id);
  }, [onSplashComplete]);

  useEffect(() => {
    return () => {
      if (
        resetTimerRef.current
      ) {
        clearTimeout(
          resetTimerRef.current
        );
      }
    };
  }, []);

  // ─── Invalid link (sound + link fade out) ─────────────────────────────────

  const showInvalidLinkError = () => {
    playInvalidSound();

    setIsLinkFading(true);

    setErrorMsg(
      "This doesn't look like a Pinterest link."
    );

    setStatus('error');

    if (resetTimerRef.current) {
      clearTimeout(
        resetTimerRef.current
      );
    }

    resetTimerRef.current =
      setTimeout(() => {
        setUrl('');

        setDisplayUrl('');

        setIsLinkFading(false);

        setStatus('idle');

        setErrorMsg('');

        resetTimerRef.current = null;
      }, 1500);
  };

  const triggerDownload =
    async (
      targetUrl: string
    ) => {
      const cleanUrl =
        targetUrl.trim();

      if (!cleanUrl) {
        return;
      }

      if (!isPinterestUrl(cleanUrl)) {
        showInvalidLinkError();
        return;
      }

      if (
        downloadInProgress.current
      ) {
        return;
      }

      downloadInProgress.current =
        true;

      setStatus('loading');

      setProgressLabel(
        t('checkingMedia')
      );

      setProgress(10);

      setErrorMsg('');

      setIsLinkFading(false);

      setSuccessInfo({});

      if (
        resetTimerRef.current
      ) {
        clearTimeout(
          resetTimerRef.current
        );

        resetTimerRef.current =
          null;
      }

      try {
        const response =
          await fetch(
            GET_PIN_URL,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                url: cleanUrl,
              }),
            }
          );

        if (!response.ok) {
          const data =
            await response
              .json()
              .catch(
                () => ({})
              );

          throw new Error(
            data.error ||
              t('errorGeneric')
          );
        }

        let downloadTriggered =
          false;

        for await (
          const event of readSSE(
            response
          )
        ) {
          if (
            event.type ===
            'stage'
          ) {
            setProgressLabel(
              getTranslatedStage(
                event.label,
                t
              )
            );

            setProgress(
              getProgressFromStage(
                event.label
              )
            );

            continue;
          }

          if (
            event.type ===
            'error'
          ) {
            throw new Error(
              event.message ||
                t(
                  'errorGeneric'
                )
            );
          }

          if (
            event.type ===
            'ready'
          ) {
            setProgressLabel(
              t(
                'startingDownload'
              )
            );

            setProgress(95);

            setSuccessInfo({
              mediaType:
                event.mediaType,
              imageCount:
                event.imageCount,
              filename:
                event.filename,
            });

            setProgressLabel(
              'Downloading file...'
            );

            await downloadStreamFile(
              event.token,
              event.filename,
              event.mediaType
            );

            setProgress(100);

            trackDownload();

            downloadTriggered =
              true;

            setStatus(
              'success'
            );

            resetTimerRef.current =
              setTimeout(() => {
                setUrl('');

                setDisplayUrl('');

                setStatus(
                  'idle'
                );

                setProgressLabel(
                  ''
                );

                setProgress(10);

                setSuccessInfo(
                  {}
                );

                resetTimerRef.current =
                  null;
              }, 3000);

            break;
          }
        }

        if (
          !downloadTriggered
        ) {
          throw new Error(
            t('errorGeneric')
          );
        }
      } catch (err: any) {
        setStatus('error');

        setErrorMsg(
          err?.message ||
            t('errorGeneric')
        );
      } finally {
        downloadInProgress.current =
          false;
      }
    };

  const handlePasteClick =
    async () => {
      if (
        status === 'loading'
      ) {
        return;
      }

      try {
        const text =
          await navigator.clipboard.readText();

        if (text?.trim()) {
          const clean =
            text.trim();

          if (
            !isPinterestUrl(clean)
          ) {
            setUrl(clean);

            setDisplayUrl(clean);

            showInvalidLinkError();
            return;
          }

          setUrl(clean);

          setDisplayUrl(clean);

          await triggerDownload(
            clean
          );
        }
      } catch (err) {
        console.error(
          'Failed to read clipboard',
          err
        );
      }
    };

  const handleNativePaste = (
    _e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    if (
      status === 'loading'
    ) {
      return;
    }

    setTimeout(() => {
      if (
        inputRef.current
      ) {
        const value =
          inputRef.current.value.trim();

        if (value) {
          setDisplayUrl(value);

          if (
            !isPinterestUrl(value)
          ) {
            setUrl(value);

            showInvalidLinkError();
            return;
          }

          setUrl(value);
          triggerDownload(
            value
          );
        }
      }
    }, 50);
  };

  const handleSubmit = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      url.trim() &&
      status !== 'loading'
    ) {
      triggerDownload(
        url.trim()
      );
    }
  };

  const handleShare =
    async () => {
      const shareUrl =
        'https://pinme.download/';

      try {
        if (
          navigator.share
        ) {
          await navigator.share({
            title:
              'pinME Downloade',
            text:
              'Fast & simple Pinterest Downloade',
            url: shareUrl,
          });

          return;
        }

        await navigator.clipboard.writeText(
          shareUrl
        );
      } catch (err: any) {
        if (
          err?.name ===
          'AbortError'
        ) {
          return;
        }

        try {
          await navigator.clipboard.writeText(
            shareUrl
          );
        } catch (
          clipboardErr
        ) {
          console.error(
            'Failed to share Pin-ME',
            clipboardErr
          );
        }
      }
    };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen />
        )}
      </AnimatePresence>

      {!showSplash &&
        serverReady ===
          'checking' && (
          <WakingScreen />
        )}

      {!showSplash &&
        serverReady ===
          'ready' && (
          <div className="relative min-h-[100dvh] w-full bg-background text-foreground flex flex-col font-sans">
            <SeasonalBackdrop
              season={season}
            />

            <header className="sticky top-0 z-50 flex flex-col items-center gap-1 p-6 bg-background">
              <div className="flex items-center gap-2">
                <img
                  src="/header-logo.png"
                  alt="pinME Logo"
                  className="h-10 w-10 object-contain"
                />

                <span className="text-2xl font-bold tracking-tight">
                  <span className="text-foreground">
                    pin
                  </span>

                  <span className="text-primary">
                    ME
                  </span>
                </span>
              </div>

              <span className="text-[10px] text-muted-foreground tracking-wider">
                v2.1.0
              </span>
            </header>

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

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="w-full space-y-4"
                >
                  <div className="relative flex items-center">
                    <input
                      ref={inputRef}
                      type="url"
                      value={displayUrl}
                      onChange={(e) => {
                        setDisplayUrl(
                          e.target.value
                        );

                        setUrl(
                          e.target.value
                        );
                      }}
                      onPaste={
                        handleNativePaste
                      }
                      placeholder={t(
                        'placeholder'
                      )}
                      className={`w-full bg-input/50 border rounded-xl py-4 pl-4 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner ${
                        isLinkFading
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-border'
                      }`}
                      disabled={
                        status ===
                        'loading'
                      }
                      style={{
                        opacity:
                          isLinkFading
                            ? 0
                            : 1,
                        transition:
                          'opacity 1.5s ease-in-out',
                      }}
                      data-testid="input-url"
                    />

                    <button
                      type="button"
                      onClick={
                        handlePasteClick
                      }
                      className="absolute right-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Paste from clipboard"
                      disabled={
                        status ===
                        'loading'
                      }
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
                    {status ===
                      'error' && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                        }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center"
                        data-testid="status-error"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2 min-h-[92px] flex justify-center items-center w-full">
                    <AnimatePresence mode="wait">
                      {status ===
                      'loading' ? (
                        <motion.div
                          key="loading"
                          initial={{
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className="w-full"
                        >
                          <ProgressLabel
                            label={
                              progressLabel ||
                              t(
                                'checkingMedia'
                              )
                            }
                            progress={
                              progress
                            }
                          />
                        </motion.div>
                      ) : status ===
                        'success' ? (
                        <motion.div
                          key="success"
                          initial={{
                            opacity: 0,
                            scale: 0.96,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          className="w-full flex flex-col items-center"
                          data-testid="status-success"
                        >
                          <div className="h-[74px] w-full flex items-center justify-center overflow-visible">
                            <CoffeeDownloadAnimation />
                          </div>

                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 6,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay: 1.05,
                              duration: 0.22,
                            }}
                            className="w-full py-4 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold text-center flex items-center justify-center gap-2 px-3"
                          >
                            <span className="text-sm sm:text-base">
                              {getSuccessMessage(
                                successInfo,
                                t
                              )}
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
                          disabled={
                            !url.trim() ||
                            status ===
                              'loading'
                          }
                          className={`w-full ${
                            season ===
                            'default'
                              ? 'bg-primary hover:bg-primary/90 disabled:hover:bg-primary'
                              : `seasonal-button seasonal-button-${season}`
                          } disabled:opacity-50 text-primary-foreground py-4 rounded-xl font-semibold text-lg transition-colors shadow-[0_0_20px_rgba(230,0,35,0.2)]`}
                          data-testid="button-submit"
                        >
                          {t(
                            'downloadNow'
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </form>

                <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
                  {t(
                    'infoText'
                  )}
                </p>

                <div className="flex justify-center pt-1">
                  <CoffeeButton />
                </div>
              </div>
            </main>

            <footer className="relative z-10 mt-0 pb-16 text-center text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash =
                      'how-it-works';

                    onOpenHowItWorks?.();
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  {t(
                    'howItWorksHomeFooter'
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    onOpenPrivacy
                  }
                  className="hover:text-foreground transition-colors"
                >
                  {t(
                    'privacyPolicy'
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    onOpenTerms
                  }
                  className="hover:text-foreground transition-colors"
                >
                  {t(
                    'termsConditions'
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    handleShare
                  }
                  aria-label="Share Pin-ME"
                  title="Share Pin-ME"
                  className="text-red-500 hover:text-red-400 hover:scale-110 transition-all duration-200 text-3xl leading-none"
                >
                  ➦
                </button>

                <span className="text-[10px] text-muted-foreground/70">
                  © 2026 pinME Downloade. All rights reserved.
                </span>
              </div>
            </footer>

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