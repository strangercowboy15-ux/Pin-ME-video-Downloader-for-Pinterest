import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Privacy from './Privacy';
import './index.css';
import { trackPageView } from './analytics'; // initialises GA4 as a side-effect

function Root() {
  const [hash, setHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    // Fire page_view for the initial route
    trackPageView(hash === '#privacy' ? '/privacy' : '/');

    const onHashChange = () => {
      const next = window.location.hash;
      setHash(next);
      // Fire page_view on every client-side route change
      trackPageView(next === '#privacy' ? '/privacy' : '/');
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (hash === '#privacy') return <Privacy />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(<Root />);
