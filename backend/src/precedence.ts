import type { Customer, PricingProfile, Product } from './types.js';
import { calculatePrice } from './priceCalculator.js';

/** Higher = more specific targeting (wins first). */
export function customerScopeScore(profile: PricingProfile, customer: Customer): number | null {
  if (profile.customerScope.type === 'customer') {
    return profile.customerScope.targetId === customer.id ? 300 : null;
  }
  if (customer.groupIds.includes(profile.customerScope.targetId)) {
    return 200;
  }
  return null;
}

/** Wine family: catalogue uses both "Wine" and "Wines" segment labels. */
function segmentMatches(scopeValue: string, productSegment: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase();
  const a = norm(scopeValue);
  const b = norm(productSegment);
  if (a === b) return true;
  if (a === 'wine' && (b === 'wine' || b === 'wines')) return true;
  if (a === 'wines' && (b === 'wine' || b === 'wines')) return true;
  return false;
}

/** Higher = narrower product coverage. */
export function productScopeScore(profile: PricingProfile, product: Product): number | null {
  const scope = profile.productScope;
  switch (scope.type) {
    case 'sku': {
      const ids = scope.productIds ?? [];
      if (ids.includes(product.id) || (scope.value && scope.value === product.sku)) {
        return 400;
      }
      return null;
    }
    case 'subCategory':
      return scope.value === product.subCategory ? 300 : null;
    case 'segment':
      return scope.value && segmentMatches(scope.value, product.segment) ? 200 : null;
    case 'all':
      return 100;
    default:
      return null;
  }
}

export function profileMatchesCustomerProduct(
  profile: PricingProfile,
  customer: Customer,
  product: Product,
): boolean {
  return (
    customerScopeScore(profile, customer) !== null &&
    productScopeScore(profile, product) !== null
  );
}

/** Combined specificity for ordering (customer half weighted equally with product). */
export function combinedSpecificityScore(
  profile: PricingProfile,
  customer: Customer,
  product: Product,
): number {
  const c = customerScopeScore(profile, customer) ?? 0;
  const p = productScopeScore(profile, product) ?? 0;
  return c + p;
}

export function adjustmentKindScore(profile: PricingProfile): number {
  return profile.adjustmentKind === 'override' ? 50 : 0;
}

export interface RankedProfile {
  profile: PricingProfile;
  computedPrice: number;
  combinedScore: number;
  kindScore: number;
  priority: number;
}

export function rankMatchingProfiles(
  profiles: PricingProfile[],
  customer: Customer,
  product: Product,
): RankedProfile[] {
  return profiles
    .filter((p) => profileMatchesCustomerProduct(p, customer, product))
    .map((profile) => ({
      profile,
      computedPrice: calculatePrice({
        basePrice: product.basePrice,
        adjustmentKind: profile.adjustmentKind,
        mode: profile.mode,
        direction: profile.direction,
        value: profile.value,
      }),
      combinedScore: combinedSpecificityScore(profile, customer, product),
      kindScore: adjustmentKindScore(profile),
      priority: profile.priority,
    }))
    .sort((a, b) => {
      if (b.combinedScore !== a.combinedScore) return b.combinedScore - a.combinedScore;
      if (b.kindScore !== a.kindScore) return b.kindScore - a.kindScore;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.computedPrice - b.computedPrice;
    });
}
