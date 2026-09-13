import React, { useEffect, useState } from 'react';

export type Season =
  | 'default'
  | 'christmas'
  | 'new-year'
  | 'valentines'
  | 'independence'
  | 'halloween';

export function getSeason(date = new Date()): Season {
  const month = date.getMonth();
  const day = date.getDate();

  // December 31 is treated as New Year's Eve when the ranges overlap.
  if ((month === 11 && day === 31) || (month === 0 && day <= 2)) {
    return 'new-year';
  }
  if (month === 11 && day >= 20) return 'christmas';
  if (month === 1 && day >= 10 && day <= 14) return 'valentines';
  if (month === 7 && day >= 13 && day <= 15) return 'independence';
  if (month === 9 && day >= 28) return 'halloween';
  return 'default';
}

export function useSeason(): Season {
  const [season, setSeason] = useState<Season>(() => getSeason());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSeason(getSeason());
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return season;
}

type Particle = {
  symbol?: string;
  left: number;
  top: number;
  delay: number;
  duration: number;
};

const PARTICLES: Record<Exclude<Season, 'default'>, Particle[]> = {
  christmas: [
    { symbol: '❄', left: 6, top: 13, delay: 0, duration: 20 },
    { symbol: '❄', left: 12, top: 78, delay: 7, duration: 24 },
    { symbol: '❄', left: 88, top: 22, delay: 4, duration: 22 },
    { symbol: '❄', left: 94, top: 70, delay: 10, duration: 26 },
  ],
  'new-year': [
    { left: 7, top: 12, delay: 0, duration: 15 },
    { left: 12, top: 80, delay: 5, duration: 18 },
    { left: 89, top: 18, delay: 3, duration: 17 },
    { left: 95, top: 74, delay: 8, duration: 20 },
    { left: 4, top: 54, delay: 10, duration: 19 },
    { left: 97, top: 42, delay: 6, duration: 16 },
  ],
  valentines: [
    { symbol: '♥', left: 7, top: 18, delay: 0, duration: 14 },
    { symbol: '♥', left: 11, top: 76, delay: 5, duration: 17 },
    { symbol: '♥', left: 89, top: 24, delay: 3, duration: 16 },
    { symbol: '♥', left: 94, top: 72, delay: 8, duration: 19 },
  ],
  independence: [
    { left: 6, top: 15, delay: 0, duration: 16 },
    { left: 12, top: 82, delay: 5, duration: 19 },
    { left: 89, top: 20, delay: 3, duration: 17 },
    { left: 95, top: 76, delay: 8, duration: 21 },
    { left: 4, top: 51, delay: 10, duration: 18 },
    { left: 97, top: 44, delay: 6, duration: 20 },
  ],
  halloween: [
    { symbol: '🦇', left: 6, top: 18, delay: 0, duration: 18 },
    { symbol: '🦇', left: 12, top: 78, delay: 7, duration: 22 },
    { symbol: '🦇', left: 88, top: 24, delay: 4, duration: 20 },
    { symbol: '🦇', left: 94, top: 72, delay: 10, duration: 24 },
  ],
};

export function SeasonalBackdrop({ season }: { season: Season }) {
  if (season === 'default') return null;

  const particles = PARTICLES[season];
  const isConfetti = season === 'new-year' || season === 'independence';

  return (
    <div className={`seasonal-backdrop seasonal-${season}`} aria-hidden="true">
      {particles.map((particle, index) => (
        <span
          key={`${season}-${index}`}
          className={`seasonal-particle${isConfetti ? ' seasonal-confetti' : ''}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.symbol}
        </span>
      ))}
    </div>
  );
}