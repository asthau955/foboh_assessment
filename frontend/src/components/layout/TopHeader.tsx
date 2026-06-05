import { useEffect, useRef, useState } from 'react';
import {
  IconBell,
  IconChevronDown,
  IconHelp,
} from '@tabler/icons-react';

function formatGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type TopHeaderProps = {
  userName?: string;
  accountName?: string;
  avatarUrl?: string;
};

export function TopHeader({
  userName = 'Alex Morgan',
  accountName = 'Fresh Produce Co.',
  avatarUrl,
}: TopHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="top-header">
      <div className="top-header__greeting">
        <p className="top-header__hello">
          {formatGreeting(now)}, <span className="top-header__name">{userName}</span>
        </p>
        <p className="top-header__date">{formatHeaderDate(now)}</p>
      </div>

      <div className="top-header__actions">
        <button type="button" className="top-header__icon-btn" aria-label="Notifications">
          <IconBell size={22} stroke={1.75} />
        </button>
        <button type="button" className="top-header__icon-btn" aria-label="Help">
          <IconHelp size={22} stroke={1.75} />
        </button>
        <span className="top-header__divider" aria-hidden />

        <div className="top-header__profile" ref={menuRef}>
          <button
            type="button"
            className="top-header__profile-trigger"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="top-header__avatar" />
            ) : (
              <span className="top-header__avatar top-header__avatar--initials">{initials}</span>
            )}
            <span className="top-header__profile-text">
              <span className="top-header__profile-name">{userName}</span>
              <span className="top-header__profile-account">{accountName}</span>
            </span>
            <IconChevronDown
              className={`top-header__chevron${menuOpen ? ' top-header__chevron--open' : ''}`}
              size={18}
              stroke={1.75}
              aria-hidden
            />
          </button>
          {menuOpen && (
            <div className="top-header__dropdown" role="menu">
              <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>
                Account settings
              </button>
              <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>
                Switch account
              </button>
              <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
