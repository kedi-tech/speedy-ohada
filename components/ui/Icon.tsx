import React from 'react';

type SVGProps = React.SVGAttributes<SVGElement> & { className?: string };

const icon = (path: React.ReactNode, extra?: SVGProps) =>
  function IconComp(props: SVGProps) {
    const { className, ...rest } = { ...extra, ...props };
    return (
      <svg
        viewBox="0 0 20 20"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className={className}
        {...rest}
      >
        {path}
      </svg>
    );
  };

export const Icons = {
  dashboard: icon(<><rect x="3" y="3" width="6" height="8" rx="1.2"/><rect x="11" y="3" width="6" height="4" rx="1.2"/><rect x="3" y="13" width="6" height="4" rx="1.2"/><rect x="11" y="9" width="6" height="8" rx="1.2"/></>),
  building:  icon(<><rect x="4" y="3" width="12" height="14" rx="1"/><path d="M7 7h2M7 10h2M7 13h2M11 7h2M11 10h2M11 13h2"/></>),
  calendar:  icon(<><rect x="3" y="5" width="14" height="12" rx="1.5"/><path d="M3 9h14M7 3v3M13 3v3"/></>),
  upload:    icon(<><path d="M10 13V4M6 8l4-4 4 4M3 13v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"/></>),
  link:      icon(<><path d="M8 12 12 8M9 5l1-1a3 3 0 1 1 4 4l-1 1M11 15l-1 1a3 3 0 0 1-4-4l1-1"/></>),
  check:     icon(<><path d="m4 10 4 4 8-8"/></>, { strokeWidth: '1.8' }),
  shield:    icon(<><path d="M10 2 4 4v6c0 4 3 7 6 8 3-1 6-4 6-8V4l-6-2Z"/></>),
  doc:       icon(<><path d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M12 3v4h4M7 12h6M7 15h4"/></>),
  notes:     icon(<><path d="M5 3h10v14l-3-2-2 2-2-2-3 2V3Z"/><path d="M8 7h4M8 10h4"/></>),
  scale:     icon(<><path d="M10 3v14M3 6h14M5 6l-2 5h4l-2-5Zm10 0-2 5h4l-2-5Z"/></>),
  eye:       icon(<><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z"/><circle cx="10" cy="10" r="2.5"/></>),
  download:  icon(<><path d="M10 3v10M6 9l4 4 4-4M3 17h14"/></>),
  archive:   icon(<><rect x="3" y="4" width="14" height="3" rx="1"/><path d="M4 7v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M8 11h4"/></>),
  users:     icon(<><circle cx="7" cy="8" r="3"/><path d="M2 17c0-3 2-5 5-5s5 2 5 5M14 8a3 3 0 1 0 0-4M18 17c0-2.4-1.4-4.4-3.5-4.9"/></>),
  settings:  icon(<><circle cx="10" cy="10" r="2.4"/><path d="M16 10c0-.5 0-1-.2-1.5l1.4-1.1-1.5-2.6-1.7.6c-.7-.6-1.5-1-2.4-1.3L11.2 2H8.8l-.4 2.1c-.9.3-1.7.7-2.4 1.3l-1.7-.6L2.8 7.4 4.2 8.5c-.1.5-.2 1-.2 1.5s0 1 .2 1.5L2.8 12.6l1.5 2.6 1.7-.6c.7.6 1.5 1 2.4 1.3l.4 2.1h2.4l.4-2.1c.9-.3 1.7-.7 2.4-1.3l1.7.6 1.5-2.6-1.4-1.1c.1-.5.2-1 .2-1.5Z"/></>),
  log:       icon(<><path d="M5 3h10v14H5z"/><path d="M8 7h4M8 10h4M8 13h4M5 7h.01M5 10h.01M5 13h.01"/></>),
  search:    icon(<><circle cx="9" cy="9" r="5.5"/><path d="m17 17-3.5-3.5"/></>, { strokeWidth: '1.7' }),
  bell:      icon(<><path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 2H3.5L5 14ZM8 17a2 2 0 0 0 4 0"/></>),
  plus:      icon(<><path d="M10 4v12M4 10h12"/></>, { strokeWidth: '1.8' }),
  arrowRight:icon(<><path d="M4 10h12M11 5l5 5-5 5"/></>, { strokeWidth: '1.7' }),
  arrowLeft: icon(<><path d="M16 10H4M9 5l-5 5 5 5"/></>, { strokeWidth: '1.7' }),
  alert:     icon(<><path d="M10 3 1.5 17h17L10 3Z"/><path d="M10 8v4M10 15h.01"/></>, { strokeWidth: '1.7' }),
  info:      icon(<><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6h.01"/></>),
  more:      icon(<><circle cx="5" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none"/></>),
  chevronDown:   (props: SVGProps) => <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="m5 8 5 5 5-5"/></svg>,
  chevronRight:  (props: SVGProps) => <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="m8 5 5 5-5 5"/></svg>,
  globe:     icon(<><circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.5 3 2.5 12 0 15M10 2.5c-2.5 3-2.5 12 0 15"/></>),
  lock:      icon(<><rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V6a3 3 0 0 1 6 0v3"/></>),
  spark:     icon(<><path d="M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M5 15l2-2M13 7l2-2"/></>, { strokeWidth: '1.6' }),
  excel:     icon(<><rect x="3" y="3" width="14" height="14" rx="1.5"/><path d="M3 8h14M8 3v14M11 11l3 4M14 11l-3 4"/></>, { strokeWidth: '1.5' }),
  pdf:       icon(<><path d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M12 3v4h4"/><path d="M7 11.5h1.5a1 1 0 1 1 0 2H7v-2Zm0 2v1.5M11 11.5h2v3.5h-2v-3.5Zm-1.5 1.75h-1"/></>, { strokeWidth: '1.5' }),
  mail:      icon(<><rect x="3" y="5" width="14" height="11" rx="1.5"/><path d="m3 6 7 6 7-6"/></>),
  user:      icon(<><circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7"/></>),
  key:       icon(<><circle cx="8" cy="11" r="4"/><path d="m12 7 5 5M17 7l-2 2"/></>),
  edit:      icon(<><path d="M13.5 4.5 15.5 6.5 7 15H5v-2l8.5-8.5ZM12 6l2 2"/></>),
  save:      icon(<><path d="M4 4h9l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M7 4v4h6V4M7 13h6"/></>),
  send:      icon(<><path d="M3 10 17 3l-3 14-5-4-3 4V10l9-5-9 5Z"/></>),
  x:         icon(<><path d="m5 5 10 10M15 5 5 15"/></>, { strokeWidth: '1.8' }),
  red:       icon(<><path d="M10 3 1.5 17h17L10 3Z"/><path d="M10 8v4M10 15h.01"/></>, { strokeWidth: '1.7' }),
  logout:    icon(<><path d="M7 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3M13 14l4-4-4-4M17 10H7"/></>),
};
