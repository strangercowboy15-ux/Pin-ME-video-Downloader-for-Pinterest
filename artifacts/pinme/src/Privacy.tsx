import React from 'react';

export default function Privacy({ onClose }: { onClose: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-4 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Privacy Policy and return to the home page"
          className="h-11 w-11 flex items-center justify-center rounded-lg text-2xl leading-none text-primary hover:bg-primary/10 transition-colors"
        >
          ✘
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.hash = '';
            onClose();
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="Return to the home page"
        >
          <img
            src="/header-logo.png"
            alt="pinME Logo"
            className="h-8 w-8 object-contain rounded-lg"
          />

          <span className="text-lg font-bold tracking-tight">
            pin<span className="text-primary">ME</span>
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>

        <p className="text-sm text-muted-foreground mb-10">
          Last updated: September 2026
        </p>

        <section className="space-y-8 text-foreground leading-relaxed">

          {/* What this app does */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              What this app does
            </h2>

            <p>
              pinME Downloader lets you download publicly accessible media from
              Pinterest. You can paste a Pinterest link and pinME processes the
              available media and sends the resulting file directly to your
              device.
            </p>

            <p className="mt-3">
              Supported media may include videos, single images, GIFs, and
              carousel images. Carousels may be delivered as a ZIP file.
            </p>
          </div>

          {/* What data we collect */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              What data we collect
            </h2>

            <p>
              We do not directly collect or store personal information such as
              your name, email address, or account information.
            </p>

            <p className="mt-3">
              The main input processed by pinME is the Pinterest URL you submit.
              You do not need to create an account or provide personal
              information to use the downloader.
            </p>
          </div>

          {/* How Pinterest URL is used */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              How your Pinterest URL is used
            </h2>

            <p>
              When you submit a Pinterest link, it is sent to our server solely
              to process the requested media and prepare it for download.
            </p>

            <p className="mt-3">
              We do not intentionally store submitted Pinterest URLs in a
              database or use them for advertising or profiling.
            </p>
          </div>

          {/* Temporary processing */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Temporary processing
            </h2>

            <p>
              pinME may temporarily create files on the server while processing
              your requested download.
            </p>

            <p className="mt-3">
              These temporary files are not intended for permanent storage and
              are automatically removed after the download or processing
              period. We do not maintain a permanent library of the videos,
              images, GIFs, or carousel content processed through the service.
            </p>
          </div>

          {/* Cookies & local storage */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Cookies &amp; local storage
            </h2>

            <p>
              We do not use tracking cookies or advertising cookies directly on
              pinME.
            </p>

            <p className="mt-3">
              The browser may store a small{' '}
              <code className="text-sm bg-muted px-1 rounded">
                localStorage
              </code>{' '}
              flag, such as{' '}
              <code className="text-sm bg-muted px-1 rounded">
                pinme_onboarding_seen
              </code>
              , to remember whether you have already seen the welcome screen.
            </p>

            <p className="mt-3">
              This localStorage value does not contain personal information and
              is not sent to our server.
            </p>
          </div>

          {/* Analytics */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Analytics &amp; third-party services
            </h2>

            <p>
              pinME uses Google Analytics to understand basic website usage,
              such as visits, engagement, and download activity.
            </p>

            <p className="mt-3">
              Google Analytics may collect information such as device and
              browser information, approximate geographic information, and
              usage data. This information is processed by Google according to
              Google's applicable policies.
            </p>

            <p className="mt-3">
              We do not use Google Analytics data to intentionally identify
              individual users.
            </p>

            <p className="mt-3">
              For more information about how Google handles data, please see{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                spellCheck={false}
                className="text-primary hover:underline"
              >
                Google's Privacy Policy
              </a>
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Contact
            </h2>

            <p>
              If you have questions about this Privacy Policy or how pinME
              handles data, you can contact us at{' '}
              <a
                href="mailto:pinmevideodownloader@gmail.com"
                className="text-primary hover:underline"
              >
                pinmevideodownloader@gmail.com
              </a>
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} pinME Downloader ·{' '}

        <button
          type="button"
          onClick={() => {
            window.history.replaceState(
              null,
              '',
              window.location.pathname
            );
            onClose();
          }}
          className="hover:text-foreground transition-colors"
        >
          Home
        </button>
      </footer>
    </div>
  );
}