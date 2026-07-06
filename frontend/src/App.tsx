import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { PriceResolverPanel } from './components/PriceResolverPanel';
import { SetupProfilePage } from './pages/SetupProfilePage';

type PricingTab = 'setup' | 'resolver';

export default function App() {
  const [tab, setTab] = useState<PricingTab>('setup');

  return (
    <AppShell activeNav="pricing">
      <nav className="tabs" aria-label="Pricing views">
        <button
          type="button"
          className={`tab${tab === 'setup' ? ' active' : ''}`}
          aria-current={tab === 'setup' ? 'page' : undefined}
          onClick={() => setTab('setup')}
        >
          Setup a profile
        </button>
        <button
          type="button"
          className={`tab${tab === 'resolver' ? ' active' : ''}`}
          aria-current={tab === 'resolver' ? 'page' : undefined}
          onClick={() => setTab('resolver')}
        >
          Price resolver
        </button>
      </nav>
      {tab === 'setup' ? <SetupProfilePage /> : <PriceResolverPanel />}
    </AppShell>
  );
}
