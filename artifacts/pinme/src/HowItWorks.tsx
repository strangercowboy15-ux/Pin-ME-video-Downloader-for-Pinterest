import React from 'react';

export default function HowItWorks({ onClose }: { onClose: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-4 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close How It Works and FAQ and return to the home page"
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
        <h1 className="text-3xl font-bold mb-2">How It Works &amp; FAQ</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Learn how to use pinME and find answers to common questions.
        </p>

        <section className="space-y-10 text-foreground leading-relaxed">

          {/* How It Works */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              How It Works
            </h2>

            <div className="space-y-4">
              <div>
                <p className="font-medium">1. Copy a Pinterest link 📎</p>
                <p className="text-muted-foreground mt-1">
                  Copy the Pinterest link containing the video, image, GIF, or carousel you want to download.
                </p>
              </div>

              <div>
                <p className="font-medium">2. Paste it in the box above 📥</p>
                <p className="text-muted-foreground mt-1">
                  Paste the copied Pinterest link into the download box on pinME.
                </p>
              </div>

              <div>
                <p className="font-medium">3. Click "Download Now" ⬇️</p>
                <p className="text-muted-foreground mt-1">
                  Start the download and let pinME process the requested media.
                </p>
              </div>

              <div>
                <p className="font-medium">4. Your download saves to your device 📱</p>
                <p className="text-muted-foreground mt-1">
                  The downloaded file is sent directly to your device.
                </p>
              </div>
            </div>
          </div>

          {/* Supported Downloads */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Supported Downloads
            </h2>

            <div className="space-y-3">
              <p>🎬 <span className="font-medium">Videos</span></p>
              <p>🖼️ <span className="font-medium">Single Images</span></p>
              <p>🎞️ <span className="font-medium">GIFs</span></p>
              <p>🖼️🖼️ <span className="font-medium">Carousels</span> — downloaded as a ZIP file</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Frequently Asked Questions ❓
            </h2>

            <div className="space-y-7">

              <div>
                <h3 className="font-semibold mb-1">
                  💯 Is pinME free?
                </h3>
                <p>
                  Yes. pinME is completely free to use and does not require an account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  🗂️ Where do downloads go?
                </h3>
                <p>
                  Your downloaded file is saved to your device's Downloads folder.
                  Depending on your device, it may also appear in your Gallery or Photos app.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  🔒 Do you store my Pinterest links?
                </h3>
                <p>
                  No. Pinterest links are processed only to provide the requested download
                  and are not permanently stored.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  👤 Do I need an account?
                </h3>
                <p>
                  No. You can use pinME without creating an account or signing in.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  📦 How are carousel downloads delivered?
                </h3>
                <p>
                  Carousel images are collected and provided together as a ZIP file
                  containing the images.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  🔗 Is pinME affiliated with Pinterest?
                </h3>
                <p>
                  No. pinME is an independent service and is not affiliated with,
                  sponsored by, or officially connected with Pinterest.
                </p>
              </div>

            </div>
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