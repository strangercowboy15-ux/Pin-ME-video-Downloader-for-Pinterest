import { createRoot } from 'react-dom/client';
import App from './App';
import Privacy from './Privacy';
import './index.css';

function Root() {
  const [hash, setHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (hash === '#privacy') return <Privacy />;
  return <App />;
}

import React from 'react';
createRoot(document.getElementById('root')!).render(<Root />);
