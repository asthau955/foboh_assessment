export type AdjustmentMode = 'fixed' | 'dynamic';
export type AdjustmentDirection = 'increase' | 'decrease';

/** How the profile changes price: calculated adjustment vs explicit target price. */
export type AdjustmentKind = 'calculated' | 'override';

export type ProductScopeType = 'all' | 'segment' | 'subCategory' | 'sku';

export type CustomerScopeType = 'group' | 'customer';

export interface Product {
  id: string;
  title: string;
  sku: string;
  brand: string;
  subCategory: string;
  segment: string;
  basePrice: number;
}

export interface CustomerGroup {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  groupIds: string[];
}

export interface ProductScope {
  type: ProductScopeType;
  /** segment name, sub-category label, or SKU depending on type */
  value?: string;
  /** When type is sku, explicit product ids from catalogue selection */
  productIds?: string[];
}

export interface CustomerScope {
  type: CustomerScopeType;
  /** group id or customer id */
  targetId: string;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerScope: CustomerScope;
  productScope: ProductScope;
  adjustmentKind: AdjustmentKind;
  mode: AdjustmentMode;
  direction: AdjustmentDirection;
  /** Dollar amount for fixed/override, or percentage 0–100 for dynamic */
  value: number;
  /** Supplier-set tie-breaker when profiles rank equally (higher wins). */
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceResolution {
  customerId: string;
  productId: string;
  basePrice: number;
  finalPrice: number;
  profileId: string | null;
  profileName: string | null;
  reason: string;
  /** Profiles that matched but lost on precedence */
  consideredProfiles: Array<{
    profileId: string;
    profileName: string;
    computedPrice: number;
    rank: number;
    eliminatedBecause?: string;
  }>;
}

export interface PreviewLine {
  productId: string;
  sku: string;
  title: string;
  basePrice: number;
  newPrice: number;
}
