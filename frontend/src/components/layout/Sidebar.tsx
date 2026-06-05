import {
  IconBuildingStore,
  IconCurrencyDollar,
  IconLayoutDashboard,
  IconPackage,
  IconPlug,
  IconSettings,
  IconShoppingCart,
  IconTruck,
  IconUsers,
} from '@tabler/icons-react';

export type NavItemId =
  | 'dashboard'
  | 'orders'
  | 'customers'
  | 'products'
  | 'pricing'
  | 'freight'
  | 'integrations'
  | 'settings';

type NavItem = {
  id: NavItemId;
  label: string;
  icon: typeof IconLayoutDashboard;
  badge?: 'new';
  href?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { id: 'orders', label: 'Orders', icon: IconShoppingCart },
  { id: 'customers', label: 'Customers', icon: IconUsers },
  { id: 'products', label: 'Products', icon: IconPackage },
  { id: 'pricing', label: 'Pricing', icon: IconCurrencyDollar },
  { id: 'freight', label: 'Freight', icon: IconTruck, badge: 'new' },
  { id: 'integrations', label: 'Integrations', icon: IconPlug },
  { id: 'settings', label: 'Settings', icon: IconSettings },
];

type SidebarProps = {
  activeId?: NavItemId;
  onNavigate?: (id: NavItemId) => void;
};

export function Sidebar({ activeId = 'pricing', onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate?.(item.id)}
                >
                  <Icon className="sidebar__icon" size={20} stroke={1.75} aria-hidden />
                  <span className="sidebar__label">{item.label}</span>
                  {item.badge === 'new' && (
                    <span className="sidebar__badge sidebar__badge--new">New</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <footer className="sidebar__footer">
        <IconBuildingStore className="sidebar__footer-icon" size={22} stroke={1.75} aria-hidden />
        <span className="sidebar__brand">FOBOH</span>
      </footer>
    </aside>
  );
}
