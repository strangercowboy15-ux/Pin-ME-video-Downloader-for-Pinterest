import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <a href="#" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="pinME Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="text-lg font-bold tracking-tight">
            pin<span className="text-primary">ME</span>
          </span>
        </a>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 2025</p>

        <section className="space-y-8 text-gray-200 leading-relaxed">

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What this app does</h2>
            <p>
              pinME Downloader lets you download videos from Pinterest. You paste a Pinterest link,
              the server fetches and converts the video, and it is sent directly to your device.
              That's the full extent of what the app does.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What data we collect</h2>
            <p>
              We collect <strong className="text-white">nothing about you personally.</strong> The
              only input we process is the Pinterest URL you submit. We do not collect your name,
              email address, IP address, device identifiers, or any other personal information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">How your Pinterest URL is used</h2>
            <p>
              When you submit a Pinterest link, it is sent to our server solely to fetch and convert
              the video. The URL is not logged, stored in a database, or shared with any third party.
              Once the video is delivered to your browser, the temporary file is deleted from our
              server automatically (within minutes).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Video storage</h2>
            <p>
              Downloaded videos are <strong className="text-white">not permanently stored</strong> on
              our servers. The server holds a temporary file only for the duration of your download
              and removes it immediately afterwards. We do not keep copies of any content you download.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Cookies &amp; local storage</h2>
            <p>
              We do not use any tracking cookies or advertising cookies. The only thing stored in your
              browser is a single flag in <code className="text-sm bg-white/10 px-1 rounded">localStorage</code>{' '}
              (<code className="text-sm bg-white/10 px-1 rounded">pinme_onboarding_seen</code>) that
              records whether you have already seen the welcome screen. It contains no personal data
              and is never sent to our servers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Analytics &amp; third-party services</h2>
            <p>
              This app does not use any analytics platforms, advertising networks, or third-party
              tracking scripts. No data about your usage is shared with or sold to any third party.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
            <p>
              If you have any questions about this policy or how the app handles data, email us at{' '}
              <a
                href="mailto:pinmevideodownloader@gmail.com"
                className="text-primary hover:underline"
              >
                pinmevideodownloader@gmail.com
              </a>
              .
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} pinME Downloader ·{' '}
        <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
      </footer>
    </div>
  );
}
