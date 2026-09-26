import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Privacy from './Privacy';
import Terms from './Terms';
import './index.css';
import { trackPageView } from './analytics';
import { ThemeProvider, ThemeToggle } from './theme';

type View = 'home' | 'privacy' | 'terms';

function getViewFromPath(): View {
  const path = window.location.pathname;
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'home';
}

function Root() {
  const [view, setView] = React.useState<View>(getViewFromPath);
  const [showThemeToggle, setShowThemeToggle] = React.useState(
    () => window.location.pathname === '/privacy' || window.location.pathname === '/terms',
  );

  const handleSplashComplete = React.useCallback(() => {
    setShowThemeToggle(true);
  }, []);

  React.useEffect(() => {
    const pathMap: Record<View, string> = {
      home: '/',
      privacy: '/privacy',
      terms: '/terms',
    };
    trackPageView(pathMap[view]);

    const path = pathMap[view];
    if (window.location.pathname !== path) {
      window.history.replaceState(null, '', path);
    }

    window.scrollTo(0, 0);
  }, [view]);

  return (
    <>
      {showThemeToggle && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-end p-4 sm:p-5">
          <div className="pointer-events-auto">
            <ThemeToggle />
          </div>
        </div>
      )}

      <div className={view === 'home' ? 'block' : 'hidden'}>
        <App
          onOpenPrivacy={() => setView('privacy')}
          onOpenTerms={() => setView('terms')}
          onSplashComplete={handleSplashComplete}
        />
      </div>

      <div className={view === 'privacy' ? 'block' : 'hidden'}>
        <Privacy
          onClose={() => {
            window.history.replaceState(null, '', window.location.pathname);
            setView('home');
          }}
        />
      </div>

      <div className={view === 'terms' ? 'block' : 'hidden'}>
        <Terms
          onClose={() => {
            window.history.replaceState(null, '', window.location.pathname);
            setView('home');
          }}
        />
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Root />
  </ThemeProvider>,
);