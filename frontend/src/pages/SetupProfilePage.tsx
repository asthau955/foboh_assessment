import { useCallback, useState } from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { BasicPricingProfileCard } from '../components/setup/BasicPricingProfileCard';
import {
  SelectProductPricing,
  type PricingScopeMode,
} from '../components/setup/SelectProductPricing';
import {
  ProductPriceAdjustment,
  type PriceAdjustmentState,
} from '../components/setup/ProductPriceAdjustment';

const DRAFT_KEY = 'foboh-pricing-profile-draft';

const BASIC_PROFILE_NAME = 'Independent Retailers — Spring 2026';
const BASIC_PROFILE_SUMMARY =
  '10% decrease on Wine segment · Independent Retailers group · Priority 10';

export function SetupProfilePage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scopeMode, setScopeMode] = useState<PricingScopeMode>('multiple');
  const [adjustment, setAdjustment] = useState<PriceAdjustmentState | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const handleAdjustmentChange = useCallback((state: PriceAdjustmentState) => {
    setAdjustment(state);
  }, []);

  const handleCancel = () => {
    setSelectedIds(new Set());
    setScopeMode('multiple');
    setAdjustment(null);
    setDraftMessage(null);
  };

  const handleSaveDraft = () => {
    const draft = {
      profileName: BASIC_PROFILE_NAME,
      scopeMode,
      selectedProductIds: [...selectedIds],
      adjustment,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftMessage('Draft saved.');
    setTimeout(() => setDraftMessage(null), 3000);
  };

  return (
    <div className="setup-profile">
      <header className="setup-profile__header">
        <div className="setup-profile__intro">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <span className="breadcrumb__parent">Pricing Profile</span>
            <IconChevronRight size={16} stroke={1.75} className="breadcrumb__sep" aria-hidden />
            <span className="breadcrumb__current" aria-current="page">
              Setup a Profile
            </span>
          </nav>
          <h1 className="setup-profile__title">Setup a Profile</h1>
          <p className="setup-profile__description">
            Setup your pricing profile, select products and assign customers.
          </p>
        </div>
        <div className="setup-profile__actions">
          <button type="button" className="btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSaveDraft}>
            Save as Draft
          </button>
        </div>
      </header>

      {draftMessage && (
        <div className="message success setup-profile__toast" role="status">
          {draftMessage}
        </div>
      )}

      <BasicPricingProfileCard
        profileName={BASIC_PROFILE_NAME}
        summary={BASIC_PROFILE_SUMMARY}
        onMakeChanges={() => {
          window.alert('Basic profile editor will open here.');
        }}
      />

      <SelectProductPricing
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        scopeMode={scopeMode}
        onScopeModeChange={setScopeMode}
        profileName={BASIC_PROFILE_NAME}
      />

      <ProductPriceAdjustment
        selectedIds={selectedIds}
        profileName={BASIC_PROFILE_NAME}
        onChange={handleAdjustmentChange}
        onBack={() => {
          document.getElementById('select-products-heading')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onNext={() => {
          window.alert('Customer assignment will be the next step.');
        }}
      />
    </div>
  );
}
