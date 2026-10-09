import { X } from "lucide-react";

interface SupportProps {
  onClose: () => void;
}

export default function Support({ onClose }: SupportProps) {
  const handleHome = () => {
    window.history.replaceState(null, "", "/");
    onClose();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <button
          onClick={handleHome}
          className="text-xl font-bold tracking-tight"
          aria-label="Go to home"
        >
          pin<span className="text-primary">ME</span>
        </button>

        <button
          onClick={onClose}
          className="rounded-full p-2 transition-colors hover:bg-muted"
          aria-label="Close support page"
        >
          <X size={22} />
        </button>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Support pinME ❤️
          </h1>

          <p className="text-muted-foreground">
            Hi everyone! I'm Ajesh Styles. I built pinME to keep
            Pinterest downloads simple and free.
          </p>

          <p className="mt-3 text-muted-foreground">
            Your support helps cover hosting, server, and domain
            costs so I can keep the project running.
          </p>
        </div>

        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">
            Choose a support method
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* PayPal */}
          <a
            href="https://www.paypal.com/ncp/payment/64BBX79BRA23S"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-border bg-muted/20 p-5 transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0070E0] text-2xl font-bold text-white">
                P
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">
                  Support with PayPal
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose any amount to support pinME
                </p>
              </div>

              <span className="text-xl text-muted-foreground">
                →
              </span>
            </div>
          </a>

          {/* Razorpay */}
          <a
            href="https://razorpay.me/@pinme"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-border bg-muted/20 p-5 transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-2xl font-bold text-white">
                R
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">
                  Support with Razorpay
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose any amount to support pinME
                </p>
              </div>

              <span className="text-xl text-muted-foreground">
                →
              </span>
            </div>
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for supporting this project! ❤️
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            No pressure — pinME is free either way.
          </p>

          <button
            onClick={handleHome}
            className="mt-5 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}