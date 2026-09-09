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

  React.useEffect(() => {
    trackPageView(view === 'privacy' ? '/privacy' : '/');
  }, [view]);

  // Keep both views mounted so switching back to the home view does not
  // remount App and replay its splash screen.
  return (
    <>
      <div className="fixed top-5 right-6 z-[60]">
        <ThemeToggle />
      </div>
      <div className={view === 'home' ? 'block' : 'hidden'}>
        <App onOpenPrivacy={() => setView('privacy')} />
      </div>
      <div className={view === 'privacy' ? 'block' : 'hidden'}>
        <Privacy onClose={() => setView('home')} />
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Root />
  </ThemeProvider>,
);
