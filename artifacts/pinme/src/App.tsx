import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const seen = localStorage.getItem('pinme_onboarding_seen');
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('pinme_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        triggerDownload(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
      // Fallback: If clipboard read fails (permissions), let user know or ignore silently
      // For this app, manual paste is still possible in the input field.
    }
  };

  const handleNativePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (inputRef.current) {
        const value = inputRef.current.value.trim();
        if (value) {
          setUrl(value);
          triggerDownload(value);
        }
      }
    }, 50);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      triggerDownload(url.trim());
    }
  };

  const triggerDownload = async (targetUrl: string) => {
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const response = await fetch('/api/get-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please check your connection and try again.");
      }
      
      const { downloadUrl, filename } = await response.json();
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || 'pinterest-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setStatus('success');
      setTimeout(() => {
        setUrl('');
        setStatus('idle');
      }, 3000);
      
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || "Something went wrong. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center gap-2 p-6 justify-center sm:justify-start">
        <img src="/logo.png" alt="pinME Logo" className="h-10 w-10 object-contain" />
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-white">pin</span>
          <span className="text-primary">ME</span>
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto relative -mt-16">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Download any Pinterest video.</h1>
            <p className="text-muted-foreground text-sm">Fast, free, and directly to your device.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={handleNativePaste}
                placeholder="Paste Pinterest link here..."
                className="w-full bg-input/50 border border-border rounded-xl py-4 pl-4 pr-14 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                disabled={status === 'loading'}
                data-testid="input-url"
              />
              <button
                type="button"
                onClick={handlePasteClick}
                className="absolute right-2 p-2 text-muted-foreground hover:text-white transition-colors"
                title="Paste from clipboard"
                disabled={status === 'loading'}
                data-testid="button-paste"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  {/* Back square */}
                  <rect x="5.5" y="1.5" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  {/* Front square */}
                  <rect x="1.5" y="6.5" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="var(--color-surface, #1e1e1e)"/>
                </svg>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center"
                  data-testid="status-error"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 h-[60px] flex justify-center items-center w-full">
              {status === 'loading' ? (
                <div className="css-spinner" data-testid="status-loading"></div>
              ) : status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-4 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold text-center flex items-center justify-center gap-2"
                  data-testid="status-success"
                >
                  <span>Downloaded</span>
                  <span className="text-lg leading-none">✓</span>
                </motion.div>
              ) : (
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg transition-colors shadow-[0_0_20px_rgba(230,0,35,0.2)]"
                  data-testid="button-submit"
                >
                  Download Video
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
            Video will be saved to your device's Downloads folder (and usually appears in your Gallery/Photos app automatically).
          </p>
        </div>
      </main>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            data-testid="modal-onboarding"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-border relative"
            >
              <button
                onClick={dismissOnboarding}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors p-2"
                data-testid="button-close-onboarding"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
              
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <img src="/logo.png" alt="pinME" className="h-20 w-20 object-contain drop-shadow-lg" />
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Welcome to pinME</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The fastest way to download Pinterest videos directly to your device.
                  </p>
                </div>
                
                <div className="w-full space-y-4 text-left text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">1</div>
                    <p className="text-gray-300">Copy a link from the Pinterest app</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">2</div>
                    <p className="text-gray-300">Paste it here (or just tap the copy icon)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">3</div>
                    <p className="text-gray-300">The video downloads automatically!</p>
                  </div>
                </div>
                
                <button
                  onClick={dismissOnboarding}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold mt-4 transition-colors"
                  data-testid="button-start"
                >
                  Let's go
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
