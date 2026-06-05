import type { PricingProfile, Product } from './types.js';

export function seedCatalogue(): Product[] {
  return [
    {
      id: 'prod-hgvpin21',
      title: 'High Garden Pinot Noir 2021',
      sku: 'HGVPIN21',
      brand: 'High Garden',
      subCategory: 'Wine Red',
      segment: 'Wine',
      basePrice: 279.06,
    },
    {
      id: 'prod-koybrun',
      title: 'Koyama Methode Brut Nature NV',
      sku: 'KOYBRUN',
      brand: 'Koyama',
      subCategory: 'Wine Sparkling',
      segment: 'Wines',
      basePrice: 120.0,
    },
    {
      id: 'prod-koynr183',
      title: 'Koyama Riesling 2018',
      sku: 'KOYNR183',
      brand: 'Koyama',
      subCategory: 'Wine Port/Dessert',
      segment: 'Wines',
      basePrice: 215.04,
    },
    {
      id: 'prod-koyrie19',
      title: 'Koyama Tussock Riesling 2019',
      sku: 'KOYRIE19',
      brand: 'Koyama',
      subCategory: 'Wine White',
      segment: 'Wines',
      basePrice: 215.04,
    },
    {
      id: 'prod-lacbnat',
      title: 'Lacourte Godbillon Brut Cru NV',
      sku: 'LACBNAT',
      brand: 'Lacourte Godbillon',
      subCategory: 'Wine Sparkling',
      segment: 'Wine',
      basePrice: 409.32,
    },
  ];
}

/** Scenario profiles A, B, C from the brief. */
export function seedProfiles(): PricingProfile[] {
  const t = '2026-01-01T00:00:00.000Z';
  return [
    {
      id: 'prof-a-wine-indie',
      name: 'Profile A — 10% off Wine (Independent Retailers)',
      customerScope: { type: 'group', targetId: 'grp-independent' },
      productScope: { type: 'segment', value: 'Wine' },
      adjustmentKind: 'calculated',
      mode: 'dynamic',
      direction: 'decrease',
      value: 10,
      priority: 10,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'prof-b-sparkling-vip',
      name: 'Profile B — $15 off Sparkling (VIP)',
      customerScope: { type: 'group', targetId: 'grp-vip' },
      productScope: { type: 'subCategory', value: 'Wine Sparkling' },
      adjustmentKind: 'calculated',
      mode: 'fixed',
      direction: 'decrease',
      value: 15,
      priority: 20,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'prof-c-bondi-koybrun',
      name: 'Profile C — Bondi Cellars KOYBRUN @ $95',
      customerScope: { type: 'customer', targetId: 'cust-bondi' },
      productScope: { type: 'sku', productIds: ['prod-koybrun'] },
      adjustmentKind: 'override',
      mode: 'fixed',
      direction: 'decrease',
      value: 95,
      priority: 100,
      createdAt: t,
      updatedAt: t,
    },
  ];
}
