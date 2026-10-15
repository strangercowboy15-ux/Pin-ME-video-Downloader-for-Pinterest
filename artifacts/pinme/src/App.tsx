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

type MicroMediaType =
  | 'video'
  | 'image'
  | 'gif'
  | 'carousel';

const NEUTRAL_STAGES = [
  'Checking media type...',
  'Analyzing Pinterest link...',
  'Verifying link status...',
  'Detecting media...',
] as const;

const IMAGE_STAGES = [
  'Fetching image info...',
  'Extracting image URL...',
  'Preparing image metadata...',
  'Image found...',
  'Downloading image...',
  'Buffering image data...',
  'Checking image quality...',
  'Processing image...',
  'Preparing image file...',
  'Optimizing image data...',
  'Finalizing image...',
  'Preparing image download...',
  'Generating image download link...',
  'Image link ready...',
  'Starting image download...',
  'Saving image to device...',
] as const;

const VIDEO_STAGES = [
  'Fetching video info...',
  'Extracting video URL...',
  'Preparing video metadata...',
  'Video ready...',
  'Downloading video...',
  'Buffering video fragments...',
  'Merging video parts...',
  'Almost finished with video...',
  'Processing video...',
  'Merging video and audio...',
  'Finalizing video output...',
  'Preparing video file...',
  'Generating video download link...',
  'Video link ready...',
  'Starting video download...',
  'Saving video to device...',
] as const;

const GIF_STAGES = [
  'Fetching GIF info...',
  'Extracting GIF URL...',
  'Preparing GIF metadata...',
  'GIF found...',
  'Downloading GIF...',
  'Buffering GIF animation...',
  'Checking GIF animation frames...',
  'Processing GIF...',
  'Preserving GIF animation...',
  'Preparing GIF file...',
  'Finalizing GIF animation...',
  'Preparing GIF download...',
  'Generating GIF download link...',
  'GIF link ready...',
  'Starting GIF download...',
  'Saving GIF to device...',
] as const;

const CAROUSEL_STAGES = [
  'Fetching carousel info...',
  'Finding carousel images...',
  'Counting carousel slides...',
  'Preparing carousel image list...',
  'Downloading carousel images...',
  'Fetching the next carousel slide...',
  'Checking carousel images...',
  'Recovering missing carousel images...',
  'Processing carousel slides...',
  'Organizing carousel images...',
  'Bundling carousel images...',
  'Preparing carousel ZIP...',
  'Finalizing carousel ZIP...',
  'Generating carousel download link...',
  'Carousel link ready...',
  'Saving carousel ZIP to device...',
] as const;

const TYPE_STAGES: Record<MicroMediaType, readonly string[]> = {
  image: IMAGE_STAGES,
  video: VIDEO_STAGES,
  gif: GIF_STAGES,
  carousel: CAROUSEL_STAGES,
};

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

// ─── Notification helper ─────────────────────────────────────────────────────

async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission =
        await Notification.requestPermission();

      return permission === 'granted';
    }

    return false;
  } catch {
    return false;
  }
}

function showDownloadNotification(
  mediaType:
    | 'video'
    | 'image'
    | 'carousel'
    | undefined,
  imageCount?: number,
) {
  try {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    let title = '📥 pinME Downloader';
    let body = 'Download complete ✓';

    if (mediaType === 'carousel') {
      body =
        imageCount && imageCount > 0
          ? `📦 Carousel ZIP downloaded (${imageCount} images) ✓`
          : '📦 Carousel ZIP downloaded ✓';
    } else if (mediaType === 'image') {
      body = '🖼️ Image downloaded ✓';
    } else if (mediaType === 'video') {
      body = '🎬 Video downloaded ✓';
    }

    const notification =
      new Notification(title, {
        body,
        icon: '/splash-logo.png',
        badge: '/splash-logo.png',
        tag: 'pinme-download',
        requireInteraction: false,
        silent: false,
      });

    setTimeout(() => {
      try {
        notification.close();
      } catch {
        /* ignore */
      }
    }, 5000);

    notification.onclick = () => {
      try {
        window.focus();
        notification.close();
      } catch {
        /* ignore */
      }
    };
  } catch {
    /* Notification not supported — silent fallback */
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
  const { t } = useLanguage();

  const [dots, setDots] =
    useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) =>
        d.length >= 3 ? '' : d + '.'
      );
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
  const hasTrailingDots = /\.{3}$/.test(label);

  if (!hasTrailingDots) {
    return <>{label}</>;
  }

  const baseLabel = label.replace(/\.{3}$/, '');

  return (
    <>
      {baseLabel}

      <span
        aria-hidden="true"
        className="inline-flex items-end ml-1"
        style={{
          gap: '2px',
          verticalAlign: 'baseline',
        }}
      >
        <span className="animate-bounce-dot">
          •
        </span>

        <span
          className="animate-bounce-dot"
          style={{ animationDelay: '0.15s' }}
        >
          •
        </span>

        <span
          className="animate-bounce-dot"
          style={{ animationDelay: '0.3s' }}
        >
          •
        </span>

        <style>{`
          @keyframes bounceDot {
            0%, 60%, 100% {
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

// ─── Circular progress indicator ─────────────────────────────────────────────

function ProgressLabel({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  const clampedProgress = Math.min(
    100,
    Math.max(0, progress)
  );

  const strokeDashoffset =
    circumference *
    (1 - clampedProgress / 100);

  const progressColor =
    clampedProgress <= 30
      ? '#ef4444'
      : clampedProgress <= 70
        ? '#eab308'
        : '#22c55e';

  const isComplete = clampedProgress === 100;

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
          transition={{ duration: 0.2 }}
          className="text-sm md:text-base text-muted-foreground text-center"
        >
          <AnimatedStageLabel label={label} />
        </motion.p>
      </AnimatePresence>

      <motion.div
        className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
        aria-label={`${clampedProgress}%`}
        animate={
          isComplete
            ? { scale: [1, 1.06, 1] }
            : { scale: 1 }
        }
        transition={
          isComplete
            ? {
                duration: 0.45,
                ease: 'easeOut',
              }
            : { duration: 0.2 }
        }
      >
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
            scale: [0.7, 1.1, 0.7],
            opacity: [0.35, 0.85, 0.35],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

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
            scale: [0.5, 1.3, 0.5],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="absolute inset-0 md:w-24 md:h-24"
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
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference,
            }}
            animate={{ strokeDashoffset }}
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
              strokeDasharray={circumference}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.35, 0],
              }}
              transition={{
                duration: 0.45,
                ease: 'easeOut',
              }}
            />
          )}
        </svg>

        <motion.span
          key={clampedProgress}
          initial={{
            opacity: 0.5,
            scale: 0.9,
          }}
          animate={
            isComplete
              ? {
                  opacity: [0.5, 1, 1],
                  scale: [0.9, 1.08, 1],
                }
              : {
                  opacity: 1,
                  scale: 1,
                }
          }
          transition={{
            duration: isComplete ? 0.45 : 0.2,
          }}
          className="relative z-10 text-sm md:text-base font-semibold text-foreground"
        >
          {clampedProgress}%
        </motion.span>
      </motion.div>
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
      type: 'progress';
      percent: number;
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
    throw new Error('Empty server response');
  }

  const reader =
    response.body.getReader();

  const decoder = new TextDecoder();

  let buffer = '';

  try {
    while (true) {
      const { done, value } =
        await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const parts = buffer.split('\n\n');

      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const line = part.trim();

        if (!line.startsWith('data: ')) {
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
      const line = buffer.trim();

      if (line.startsWith('data: ')) {
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

// ─── Support button ──────────────────────────────────────────────────────────

function SupportButton() {
  return (
    <div className="relative inline-flex">
      {/* Soft animated red glow around the board */}
      <motion.span
        aria-hidden="true"
        className="absolute -inset-2 rounded-full bg-red-500/20 blur-md"
        animate={{
          opacity: [0.35, 0.75, 0.35],
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.span
        aria-hidden="true"
        className="absolute -inset-[1px] rounded-full border border-red-500/40"
        animate={{
          opacity: [0.45, 0.9, 0.45],
          boxShadow: [
            '0 0 6px rgba(239,68,68,0.12)',
            '0 0 18px rgba(239,68,68,0.32)',
            '0 0 6px rgba(239,68,68,0.12)',
          ],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <a
        id="support-pinme-button"
        href="/support"
        aria-label="Support pinME"
        className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-red-500/50 bg-background/90 px-5 py-2.5 text-sm font-semibold text-red-500 backdrop-blur-sm transition-all duration-200 hover:border-red-500/80 hover:bg-red-500/5 hover:text-red-400 hover:shadow-[0_0_22px_rgba(239,68,68,0.28)] active:scale-95"
      >
        <span>
          Support pinME
        </span>

        <motion.span
          aria-hidden="true"
          className="inline-block text-sm"
          animate={{
            x: [0, 3, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          →
        </motion.span>
      </a>
    </div>
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
      return t('fetchingVideoInfo');

    case 'fetching image info...':
      return t('fetchingImageInfo');

    case 'fetching carousel info...':
      return t('fetchingCarouselInfo');

    case 'fetching gif info...':
      return t('fetchingGifInfo');

    case 'fetching info...':
      return t('fetchingInfo');

    case 'downloading video...':
      return t('downloadingVideo');

    case 'downloading image...':
      return t('downloadingImage');

    case 'downloading gif...':
      return t('downloadingGif');

    case 'downloading carousel...':
      return t('downloadingCarousel');

    case 'processing video...':
      return t('processingVideo');

    case 'converting image to svg...':
      return t('convertingImageSvg');

    case 'converting image to png...':
      return t('convertingImagePng');

    case 'converting carousel to svg...':
      return t('convertingCarouselSvg');

    case 'converting carousel to png...':
      return t('convertingCarouselPng');

    case 'packaging carousel...':
      return t('packagingCarousel');

    case 'preparing download...':
      return t('preparingDownload');

    case 'starting download...':
      return t('startingDownload');

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
    successInfo.filename?.toLowerCase() ?? '';

  const isGif = filename.endsWith('.gif');
  const isZip = filename.endsWith('.zip');

  if (
    successInfo.mediaType === 'carousel' ||
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
    successInfo.mediaType === 'image' &&
    isGif
  ) {
    return 'GIF downloaded';
  }

  if (isGif) {
    return 'GIF downloaded';
  }

  if (successInfo.mediaType === 'image') {
    return t('imageDownloaded');
  }

  if (successInfo.mediaType === 'video') {
    return t('videoDownloaded');
  }

  if (
    filename.endsWith('.mp4') ||
    filename.endsWith('.webm') ||
    filename.endsWith('.mov') ||
    filename.endsWith('.mkv')
  ) {
    return t('videoDownloaded');
  }

  return t('imageDownloaded');
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
    filename.toLowerCase().endsWith('.zip')
  ) {
    const response = await fetch(streamUrl, {
      method: 'GET',
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(
        `Carousel download failed (${response.status})`
      );
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error(
        'The carousel ZIP is empty.'
      );
    }

    const firstBytes = await blob
      .slice(0, 4)
      .arrayBuffer();

    const bytes = new Uint8Array(firstBytes);

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
      URL.createObjectURL(blob);

    try {
      const a =
        document.createElement('a');

      a.href = objectUrl;

      a.download =
        filename ||
        'pinterest-carousel.zip';

      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setTimeout(
        () => URL.revokeObjectURL(objectUrl),
        1000
      );
    }

    return;
  }

  const a =
    document.createElement('a');

  a.href = streamUrl;

  a.download =
    filename || 'pinterest-download';

  a.rel = 'noopener';

  document.body.appendChild(a);
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
  const serverReady = useServerReady();
  const season = useSeason();
  const { t } = useLanguage();

  const [showSplash, setShowSplash] =
    useState(true);

  const [url, setUrl] = useState('');
  const [displayUrl, setDisplayUrl] =
    useState('');

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

  const [microIndex, setMicroIndex] = useState(0);
  const [detectedType, setDetectedType] =
    useState<MicroMediaType | null>(null);

  const detectMediaType = (): MicroMediaType | null => {
    try {
      const label = String(progressLabel || '').toLowerCase();
      const matchesTranslatedStage = (key: string) =>
        label === String(t(key) || '').trim().toLowerCase();

      if (
        label.includes('carousel') ||
        matchesTranslatedStage('fetchingCarouselInfo') ||
        matchesTranslatedStage('downloadingCarousel')
      ) {
        return 'carousel';
      }
      if (
        label.includes('gif') ||
        matchesTranslatedStage('fetchingGifInfo') ||
        matchesTranslatedStage('downloadingGif')
      ) {
        return 'gif';
      }
      if (
        label.includes('video') ||
        matchesTranslatedStage('fetchingVideoInfo') ||
        matchesTranslatedStage('downloadingVideo') ||
        matchesTranslatedStage('processingVideo')
      ) {
        return 'video';
      }
      if (
        label.includes('image info') ||
        label.includes('downloading image') ||
        matchesTranslatedStage('fetchingImageInfo') ||
        matchesTranslatedStage('downloadingImage')
      ) {
        return 'image';
      }
      return null;
    } catch {
      return null;
    }
  };

  const currentMicroStage = (): string => {
    try {
      const currentStages = detectedType
        ? TYPE_STAGES[detectedType]
        : NEUTRAL_STAGES;
      const safeIndex = Math.max(
        0,
        Math.min(microIndex, currentStages.length - 1),
      );
      return currentStages[safeIndex] || NEUTRAL_STAGES[0];
    } catch {
      return NEUTRAL_STAGES[0];
    }
  };

  const [progress, setProgress] =
    useState(1);

  // 👇 Smooth timer progress (goes 1 → 99)
  const [smoothProgress, setSmoothProgress] =
    useState(1);

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
    useRef<HTMLInputElement>(null);

  const downloadInProgress = useRef(false);

  const resetTimerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setShowSplash(false);
      onSplashComplete?.();
    }, 1800);

    return () => clearTimeout(id);
  }, [onSplashComplete]);

  useEffect(() => {
    if (showSplash) {
      return;
    }

    const id = setTimeout(() => {
      requestNotificationPermission();
    }, 2500);

    return () => clearTimeout(id);
  }, [showSplash]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      setDetectedType(null);
      return;
    }

    const typeFromLabel = detectMediaType();
    if (typeFromLabel) {
      setDetectedType(typeFromLabel);
    }
  }, [status, progressLabel, t]);

  useEffect(() => {
    setMicroIndex(0);
  }, [status, detectedType]);

  useEffect(() => {
    if (status !== 'loading') {
      return;
    }

    const id = setInterval(() => {
      setMicroIndex((i) => {
        try {
          const stages = detectedType
            ? TYPE_STAGES[detectedType]
            : NEUTRAL_STAGES;
          if (stages.length === 0) return 0;
          if (i >= stages.length - 1) {
            return stages.length - 1;
          }
          return i + 1;
        } catch {
          return 0;
        }
      });
    }, 1800);

    return () => clearInterval(id);
  }, [status, detectedType]);

  // ─── Smooth timer progress (1 → 99) ─────────────────────────────────────
  // Starts at 1, climbs smoothly, respects the actual stage floor.
  // Never exceeds 99 — jumps to 100 on real completion.
  useEffect(() => {
    if (status !== 'loading') {
      setSmoothProgress(1);
      return;
    }

    const id = setInterval(() => {
      setSmoothProgress((prev) => {
        if (prev >= 99) return 99;

        // Adaptive speed: fast at start, slower near end
        let increment = 0.5;
        if (prev > 40) increment = 0.4;
        if (prev > 70) increment = 0.3;
        if (prev > 85) increment = 0.2;
        if (prev > 95) increment = 0.1;

        const next = prev + increment;

        // Never below the actual stage progress (floor)
        const floor = progress;

        // Never above 99
        return Math.min(
          99,
          Math.max(next, floor)
        );
      });
    }, 150);

    return () => clearInterval(id);
  }, [status, progress]);

  const showInvalidLinkError = () => {
    playInvalidSound();

    setIsLinkFading(true);

    setErrorMsg(
      "This doesn't look like a Pinterest link."
    );

    setStatus('error');

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setUrl('');
      setDisplayUrl('');
      setIsLinkFading(false);
      setStatus('idle');
      setErrorMsg('');
      resetTimerRef.current = null;
    }, 1500);
  };

  const triggerDownload = async (
    targetUrl: string
  ) => {
    const cleanUrl = targetUrl.trim();

    if (!cleanUrl) {
      return;
    }

    if (!isPinterestUrl(cleanUrl)) {
      showInvalidLinkError();
      return;
    }

    if (downloadInProgress.current) {
      return;
    }

    downloadInProgress.current = true;

    setStatus('loading');
    setProgressLabel(t('checkingMedia'));
    setProgress(10);
    setSmoothProgress(1);
    setErrorMsg('');
    setIsLinkFading(false);
    setSuccessInfo({});

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    try {
      const response = await fetch(
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
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.error || t('errorGeneric')
        );
      }

      let downloadTriggered = false;

      for await (const event of readSSE(
        response
      )) {
        if (event.type === 'stage') {
          setProgressLabel(
            getTranslatedStage(
              event.label,
              t
            )
          );

          setProgress(
            getProgressFromStage(event.label)
          );

          continue;
        }

        if (event.type === 'progress') {
          try {
            // Map real 0-100 to UI 10-95 range
            const mapped = 10 + (event.percent * 0.85);
            setProgress(mapped);
            setSmoothProgress(mapped);
          } catch {
            /* silent */
          }
          continue;
        }

        if (event.type === 'error') {
          throw new Error(
            event.message ||
              t('errorGeneric')
          );
        }

        if (event.type === 'ready') {
          setProgressLabel(
            t('startingDownload')
          );

          setProgress(95);

          setSuccessInfo({
            mediaType: event.mediaType,
            imageCount: event.imageCount,
            filename: event.filename,
          });

          setProgressLabel(
            'Downloading file...'
          );

          await downloadStreamFile(
            event.token,
            event.filename,
            event.mediaType
          );

          // 🎯 Complete — force smooth to 100
          setProgress(100);
          setSmoothProgress(100);

          showDownloadNotification(
            event.mediaType,
            event.imageCount
          );

          trackDownload(event.mediaType);

          downloadTriggered = true;

          setStatus('success');

          resetTimerRef.current =
            setTimeout(() => {
              setUrl('');
              setDisplayUrl('');
              setStatus('idle');
              setProgressLabel('');
              setProgress(1);
              setSmoothProgress(1);
              setSuccessInfo({});
              resetTimerRef.current = null;
            }, 3000);

          break;
        }
      }

      if (!downloadTriggered) {
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
      downloadInProgress.current = false;
    }
  };

  const handlePasteClick = async () => {
    if (status === 'loading') {
      return;
    }

    try {
      const text =
        await navigator.clipboard.readText();

      if (text?.trim()) {
        const clean = text.trim();

        if (!isPinterestUrl(clean)) {
          setUrl(clean);
          setDisplayUrl(clean);
          showInvalidLinkError();
          return;
        }

        setUrl(clean);
        setDisplayUrl(clean);

        await triggerDownload(clean);
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
    if (status === 'loading') {
      return;
    }

    setTimeout(() => {
      if (inputRef.current) {
        const value =
          inputRef.current.value.trim();

        if (value) {
          setDisplayUrl(value);

          if (!isPinterestUrl(value)) {
            setUrl(value);
            showInvalidLinkError();
            return;
          }

          setUrl(value);
          triggerDownload(value);
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

  const handleShare = async () => {
    const shareUrl =
      'https://pinme.download/';

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'pinME Downloade',
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
        err?.name === 'AbortError'
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          shareUrl
        );
      } catch (clipboardErr) {
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
        serverReady === 'checking' && (
          <WakingScreen />
        )}

      {!showSplash &&
        serverReady === 'ready' && (
          <div className="relative min-h-[100dvh] w-full bg-background text-foreground flex flex-col font-sans">
            <SeasonalBackdrop
              season={season}
            />

            <header className="sticky top-0 z-50 flex flex-col items-center gap-1 p-6 md:p-8 bg-background">
              <div className="flex items-center gap-2 md:gap-3">
                <img
                  src="/header-logo.png"
                  alt="pinME Logo"
                  className="h-10 w-10 md:h-14 md:w-14 object-contain"
                />

                <span className="text-2xl md:text-4xl font-bold tracking-tight">
                  <span className="text-foreground">
                    pin
                  </span>

                  <span className="text-primary">
                    ME
                  </span>
                </span>
              </div>

              <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider">
                v2.1.0
              </span>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-10 lg:p-12 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto">
              <div className="w-full space-y-8 md:space-y-10">
                <div className="text-center space-y-2 md:space-y-3">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance max-w-[360px] md:max-w-[700px] lg:max-w-[900px] mx-auto">
                    {t('heading')}
                  </h1>

                  <p className="text-muted-foreground text-sm md:text-lg max-w-[320px] md:max-w-[550px] mx-auto">
                    {t('subtitle')}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="w-full space-y-4 md:space-y-6"
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
                      className={`w-full bg-input/50 border rounded-xl py-4 md:py-6 pl-4 md:pl-7 pr-14 md:pr-16 text-foreground md:text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner ${
                        isLinkFading
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-border'
                      }`}
                      disabled={
                        status === 'loading'
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
                      className="absolute right-2 md:right-3 p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Paste from clipboard"
                      disabled={
                        status === 'loading'
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
                        className="md:w-6 md:h-6"
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
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 md:p-4 rounded-lg text-sm md:text-base text-center"
                        data-testid="status-error"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2 min-h-[92px] md:min-h-[120px] flex justify-center items-center w-full">
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
                            label={currentMicroStage()}
                            progress={Math.round(
                              smoothProgress
                            )}
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
                              delay: 0.1,
                              duration: 0.22,
                            }}
                            className="w-full py-4 md:py-6 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold text-center flex items-center justify-center gap-2 px-3 md:px-4"
                          >
                            <span className="text-sm sm:text-base md:text-xl">
                              {getSuccessMessage(
                                successInfo,
                                t
                              )}
                            </span>

                            <span className="text-lg md:text-2xl leading-none">
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
                          } disabled:opacity-50 text-primary-foreground py-4 md:py-6 rounded-xl font-semibold text-lg md:text-2xl transition-colors shadow-[0_0_20px_rgba(230,0,35,0.2)]`}
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

                <p className="text-center text-xs md:text-sm text-muted-foreground leading-relaxed px-4 md:px-8">
                  {t('infoText')}
                </p>

                {/* ─── Support pinME ─────────────────────────────────────── */}
                <div className="flex justify-center pt-1">
                  <SupportButton />
                </div>
              </div>
            </main>

            <footer className="relative z-10 mt-0 pb-16 text-center text-xs md:text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-2 md:gap-3">
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
                  className="text-red-500 hover:text-red-400 hover:scale-110 transition-all duration-200 text-3xl md:text-4xl leading-none"
                >
                  ➦
                </button>

                <span className="text-[10px] md:text-xs text-muted-foreground/70">
                  © 2026 pinME
                  Downloade. All rights
                  reserved.
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