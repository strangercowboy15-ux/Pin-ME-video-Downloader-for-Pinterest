import React from 'react';

export default function Terms({ onClose }: { onClose: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-4 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Terms and Conditions and return to the home page"
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
          <img src="/header-logo.png" alt="pinME Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="text-lg font-bold tracking-tight">
            pin<span className="text-primary">ME</span>
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: September 2026</p>

        <section className="space-y-8 text-foreground leading-relaxed">

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. About pinME</h2>
            <p>
              pinME Downloader is a web service that helps users download publicly accessible
              media from Pinterest links.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Use of the Service</h2>
            <p>
              You may use pinME only for lawful purposes. You are responsible for how you use
              content downloaded through the service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Copyright</h2>
            <p>
              pinME does not own or claim ownership of content downloaded through the service.
              Users are responsible for respecting copyright and other rights of content owners.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Pinterest and Third-Party Services</h2>
            <p>
              pinME is an independent service and is not affiliated with, sponsored by, or
              officially connected with Pinterest.
            </p>
            <p className="mt-2">
              Changes to Pinterest or other third-party services may affect the availability or
              functionality of downloads.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Service Availability</h2>
            <p>
              We try to keep pinME available, but we do not guarantee that the service will always
              be available, uninterrupted, or error-free.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Temporary Processing</h2>
            <p>
              Media is processed temporarily to provide the requested download. For information
              about data handling and temporary files, please see our Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Prohibited Use</h2>
            <p>
              You must not use pinME to abuse, overload, disrupt, or interfere with the service or
              its infrastructure.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Changes to pinME</h2>
            <p>
              We may add, modify, or remove features of the service at any time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Changes to These Terms</h2>
            <p>
              These Terms &amp; Conditions may be updated from time to time. The latest version
              will be published on this page.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
            <p>
              For questions about these Terms:{' '}
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
            window.history.replaceState(null, '', window.location.pathname);
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