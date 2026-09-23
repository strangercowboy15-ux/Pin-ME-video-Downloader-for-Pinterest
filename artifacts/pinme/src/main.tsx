import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Privacy from './Privacy';
import './index.css';
import { trackPageView } from './analytics'; // initialises GA4 as a side-effect
import { ThemeProvider, ThemeToggle } from './theme';

function Root() {
  const [view, setView] = React.useState<'home' | 'privacy'>(
    () => window.location.hash === '#privacy' ? 'privacy' : 'home',
  );
  const [showThemeToggle, setShowThemeToggle] = React.useState(
    () => window.location.hash === '#privacy',
  );

  const handleSplashComplete = React.useCallback(() => {
    setShowThemeToggle(true);
  }, []);

  React.useEffect(() => {
    trackPageView(view === 'privacy' ? '/privacy' : '/');
  }, [view]);
// Scroll to top whenever the view changes
React.useEffect(() => {
  window.scrollTo(0, 0);
}, [view]);

  // Keep both views mounted so switching back to the home view does not
  // remount App and replay its splash screen.
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
          onSplashComplete={handleSplashComplete}
        />
      </div>
      <div className={view === 'privacy' ? 'block' : 'hidden'}>
      <Privacy onClose={() => {
  window.history.replaceState(null, '', window.location.pathname);
  setView('home');
}} />
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Root />
  </ThemeProvider>,
);
