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
          <img src="/header-logo.png" alt="pinME Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="text-lg font-bold tracking-tight">
            pin<span className="text-primary">ME</span>
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 2026</p>

        <section className="space-y-8 text-foreground leading-relaxed">

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">What this app does</h2>
            <p>
              pinME Downloader lets you download videos from Pinterest. You paste a Pinterest link,
              the server fetches and converts the video, and it is sent directly to your device.
              That's the full extent of what the app does.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">What data we collect</h2>
            <p>
              We collect <strong className="text-foreground">nothing about you personally.</strong> The
              only input we process is the Pinterest URL you submit. We do not collect your name,
              email address, IP address, device identifiers, or any other personal information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">How your Pinterest URL is used</h2>
            <p>
              When you submit a Pinterest link, it is sent to our server solely to fetch and convert
              the video. The URL is not logged, stored in a database, or shared with any third party.
              Once the video is delivered to your browser, the temporary file is deleted from our
              server automatically (within minutes).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Video storage</h2>
            <p>
              Downloaded videos are <strong className="text-foreground">not permanently stored</strong> on
              our servers. The server holds a temporary file only for the duration of your download
              and removes it immediately afterwards. We do not keep copies of any content you download.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Cookies &amp; local storage</h2>
            <p>
              We do not use any tracking cookies or advertising cookies. The only thing stored in your
              browser is a single flag in <code className="text-sm bg-muted px-1 rounded">localStorage</code>{' '}
              (<code className="text-sm bg-muted px-1 rounded">pinme_onboarding_seen</code>) that
              records whether you have already seen the welcome screen. It contains no personal data
              and is never sent to our servers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Analytics &amp; third-party services</h2>
            <p>
              This app uses Google Analytics to understand basic usage patterns, such as how many
              people visit the site and how many downloads happen. Google Analytics may collect
              anonymized information such as your approximate location (country-level) and
              device/browser type. We do not collect or share any personally identifiable
              information. You can learn more about how Google handles data at{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google's Privacy Policy
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p>
              If you have any questions about this policy or how the app handles data, email us at{' '}
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
