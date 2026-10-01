import React from 'react';
import { useLanguage } from './useLanguage';

export default function HowItWorks({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-4 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('howItWorksClose')}
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
          aria-label={t('howItWorksHome')}
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
        <h1 className="text-3xl font-bold mb-2">
          {t('howItWorksPageTitle')}
        </h1>

        <p className="text-sm text-muted-foreground mb-10">
          {t('howItWorksPageSubtitle')}
        </p>

        <section className="space-y-10 text-foreground leading-relaxed">
          {/* How It Works */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('howItWorksSectionTitle')}
            </h2>

            <div className="space-y-4">
              <div>
                <p className="font-medium">
                  {t('howStep1Title')}
                </p>

                <p className="text-muted-foreground mt-1">
                  {t('howStep1Description')}
                </p>
              </div>

              <div>
                <p className="font-medium">
                  {t('howStep2Title')}
                </p>

                <p className="text-muted-foreground mt-1">
                  {t('howStep2Description')}
                </p>
              </div>

              <div>
                <p className="font-medium">
                  {t('howStep3Title')}
                </p>

                <p className="text-muted-foreground mt-1">
                  {t('howStep3Description')}
                </p>
              </div>

              <div>
                <p className="font-medium">
                  {t('howStep4Title')}
                </p>

                <p className="text-muted-foreground mt-1">
                  {t('howStep4Description')}
                </p>
              </div>
            </div>
          </div>

          {/* Supported Downloads */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('supportedDownloadsTitle')}
            </h2>

            <div className="space-y-3">
              <p>
                🎬{' '}
                <span className="font-medium">
                  {t('supportedVideos')}
                </span>
              </p>

              <p>
                🖼️{' '}
                <span className="font-medium">
                  {t('supportedImages')}
                </span>
              </p>

              <p>
                🎞️{' '}
                <span className="font-medium">
                  {t('supportedGifs')}
                </span>
              </p>

              <p>
                🖼️🖼️{' '}
                <span className="font-medium">
                  {t('supportedCarousels')}
                </span>{' '}
                — {t('supportedCarouselsDescription')}
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('faqPageTitle')} ❓
            </h2>

            <div className="space-y-7">
              <div>
                <h3 className="font-semibold mb-1">
                  {t('faqPage1Question')}
                </h3>

                <p className="text-muted-foreground">
                  {t('faqPage1Answer')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {t('faqPage2Question')}
                </h3>

                <p className="text-muted-foreground">
                  {t('faqPage2Answer')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {t('faqPage3Question')}
                </h3>

                <p className="text-muted-foreground">
                  {t('faqPage3Answer')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {t('faqPage4Question')}
                </h3>

                <p className="text-muted-foreground">
                  {t('faqPage4Answer')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {t('faqPage5Question')}
                </h3>

                <p className="text-muted-foreground">
                  {t('faqPage5Answer')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {t('faqPage6Question')}
                </h3>

                <p className="text-muted-foreground">
                  {t('faqPage6Answer')}
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