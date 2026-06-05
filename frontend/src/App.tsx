import { AppShell } from './components/layout/AppShell';
import { SetupProfilePage } from './pages/SetupProfilePage';

export default function App() {
  return (
    <AppShell activeNav="pricing">
      <SetupProfilePage />
    </AppShell>
  );
}
