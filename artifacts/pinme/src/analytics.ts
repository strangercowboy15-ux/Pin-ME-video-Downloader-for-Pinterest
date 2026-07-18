/**
 * Lightweight GA4 analytics wrapper.
 *
 * - Loads the gtag script dynamically only when a Measurement ID is configured.
 * - Every call is wrapped in try/catch — analytics must NEVER break the app.
 * - Gracefully does nothing if the script is blocked by an ad-blocker.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function initGA(): void {
  if (!GA_ID) return; // not configured — silent no-op

  try {
    // Inject the async gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Bootstrap the dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag as typeof window.gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      // Don't send the full URL path — hashes are routed client-side only
      send_page_view: false,
    });
  } catch {
    // blocked or failed — app continues normally
  }
}

// Run once at module load time
initGA();

/**
 * Fire a page_view event for a given path.
 * Call whenever the visible route changes (initial load + hash navigation).
 */
export function trackPageView(path: string): void {
  try {
    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: document.title,
    });
  } catch {
    // silent
  }
}

/**
 * Fire a custom `download_video` event.
 * Call once the server confirms the video is ready and the download is triggered.
 */
export function trackDownload(): void {
  try {
    window.gtag?.('event', 'download_video', {
      event_category: 'engagement',
    });
  } catch {
    // silent
  }
}
