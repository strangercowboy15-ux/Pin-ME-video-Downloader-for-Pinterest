
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
              {/* PayPal */}
              <a
                href="https://www.paypal.com/ncp/payment/64BBX79BRA23S"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-muted/20 p-5 hover:bg-primary/10 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/paypal-logo.svg"
                    alt="PayPal"
                    className="w-[30px] h-[30px] object-contain shrink-0"
                  />

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

              {/* Razorpay */}
              <a
                href="https://razorpay.me/@pinme"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-muted/20 p-5 hover:bg-primary/10 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/razorpay-logo.svg"
                    alt="Razorpay"
                    className="w-[30px] h-[30px] object-contain shrink-0"
                  />

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
