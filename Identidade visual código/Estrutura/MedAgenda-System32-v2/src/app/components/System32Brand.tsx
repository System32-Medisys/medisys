import { useId } from 'react';

/** Compact vector adaptation of the approved System32 brand reference. */
export function System32Brand() {
  const gradient = useId();
  return (
    <div className="system32-brand" aria-label="Desenvolvido por System32 Software House">
      <svg viewBox="0 0 100 110" width="46" height="50" aria-hidden="true">
        <defs><linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#00AEEF"/><stop offset="1" stopColor="#00FFC8"/></linearGradient></defs>
        <g fill="none" stroke={`url(#${gradient})`} strokeWidth="5" strokeLinejoin="round">
          <path d="M50 6 88 28V80L50 103 12 80V29Z"/>
          <path d="M18 39 31 31H42M58 88 69 78H82M65 31 88 8M73 8H88V23"/>
          <circle cx="45" cy="31" r="3"/><circle cx="55" cy="88" r="3"/>
        </g>
        <text x="50" y="73" textAnchor="middle" fill={`url(#${gradient})`} fontFamily="Arial, sans-serif" fontWeight="900" fontSize="48" letterSpacing="-5">32</text>
      </svg>
      <div><small>Desenvolvido por</small><strong>System<span>32</span></strong><em>SOFTWARE HOUSE</em></div>
    </div>
  );
}
