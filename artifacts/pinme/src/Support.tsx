
import React from 'react';

export default function Support({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-4 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Support and return to the home page"
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

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">
          Support pinME
        </h1>

        <p className="text-sm text-muted-foreground mb-10">
          Help keep pinME online and growing.
        </p>

        <section className="space-y-8 text-foreground leading-relaxed">
          <div>
            <p>
              Hi everyone! I’m Ajesh Styles. I built pinME to keep Pinterest
              downloads simple and free.
            </p>

            <p className="mt-3">
              Keeping it online and improving it takes time and money.
            </p>

            <p className="mt-3">
              Your support helps cover hosting, server, and domain costs
              and keeps pinME free for everyone.
            </p>

            <p className="mt-3">
              If you find pinME useful, you can support the project with any
              amount you choose.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Choose a support method
            </h2>

            <div className="space-y-4">
              {/* PayPal Support */}
              <a
                href="https://www.paypal.com/ncp/payment/64BBX79BRA23S"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-muted/20 p-5 hover:bg-primary/10 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      d="M7.2 3.5H13C16.6 3.5 18.8 5.4 18.8 8.4C18.8 11.7 16.3 13.8 12.5 13.8H9.9L9 19.5H5.8L7.2 3.5Z"
                      fill="#003087"
                    />

                    <path
                      d="M10.2 6.3H14C16.1 6.3 17.4 7.3 17.4 9C17.4 10.9 15.9 12.1 13.7 12.1H9.8L10.2 6.3Z"
                      fill="#0070BA"
                    />
                  </svg>

                  <div>
                    <h3 className="font-semibold">
                      Support with PayPal
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1">
                      Choose any amount to support pinME
                    </p>
                  </div>
                </div>
              </a>

              {/* Razorpay Support */}
              <a
                href="https://razorpay.me/@pinme"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-muted/20 p-5 hover:bg-primary/10 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      d="M4 3H20L12 21L4 3Z"
                      fill="#3395FF"
                    />

                    <path
                      d="M4 3H12L12 21L4 3Z"
                      fill="#072654"
                    />
                  </svg>

                  <div>
                    <h3 className="font-semibold">
                      Support with Razorpay
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1">
                      Choose any amount to support pinME
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              No pressure — pinME is free either way.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-16 px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} pinME Downloader ·{' '}

        <button
          type="button"
          onClick={() => {
            window.history.replaceState(null, '', '/');
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
