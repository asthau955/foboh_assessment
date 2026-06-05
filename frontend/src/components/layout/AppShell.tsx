import type { ReactNode } from 'react';
import type { NavItemId } from './Sidebar';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

type AppShellProps = {
  children: ReactNode;
  activeNav?: NavItemId;
  onNavigate?: (id: NavItemId) => void;
};

export function AppShell({ children, activeNav = 'pricing', onNavigate }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar activeId={activeNav} onNavigate={onNavigate} />
      <div className="app-shell__main">
        <TopHeader />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
