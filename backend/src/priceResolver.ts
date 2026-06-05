import type { PriceResolution } from './types.js';
import { rankMatchingProfiles } from './precedence.js';
import { calculatePrice, type CalculationInput } from './priceCalculator.js';
import { getCustomer, getProduct, listProfiles } from './store.js';

function explainWinner(
  winner: ReturnType<typeof rankMatchingProfiles>[0],
  ranked: ReturnType<typeof rankMatchingProfiles>,
): string {
  const parts: string[] = [
    `Profile "${winner.profile.name}" applies because it has the highest targeting specificity among ${ranked.length} matching profile(s).`,
  ];

  if (winner.profile.adjustmentKind === 'override') {
    parts.push(
      'It is an explicit customer price override, which takes precedence over calculated discounts at the same specificity tier.',
    );
  }

  if (ranked.length > 1) {
    const runner = ranked[1];
    parts.push(
      `Runner-up "${runner.profile.name}" would price at $${runner.computedPrice.toFixed(2)} but loses on ${describeLoss(winner, runner)}.`,
    );
  }

  return parts.join(' ');
}

function describeLoss(
  winner: ReturnType<typeof rankMatchingProfiles>[0],
  loser: ReturnType<typeof rankMatchingProfiles>[0],
): string {
  if (winner.combinedScore > loser.combinedScore) {
    return 'narrower customer/product scope';
  }
  if (winner.kindScore > loser.kindScore) {
    return 'override vs calculated adjustment';
  }
  if (winner.priority > loser.priority) {
    return `supplier priority (${winner.priority} vs ${loser.priority})`;
  }
  return 'tie-break: lowest final price for the customer';
}

export function resolvePrice(customerId: string, productId: string): PriceResolution {
  const customer = getCustomer(customerId);
  const product = getProduct(productId);
  const profiles = listProfiles();
  const ranked = rankMatchingProfiles(profiles, customer, product);

  if (ranked.length === 0) {
    return {
      customerId,
      productId,
      basePrice: product.basePrice,
      finalPrice: product.basePrice,
      profileId: null,
      profileName: null,
      reason: 'No pricing profile matches this customer and product; catalogue base price applies.',
      consideredProfiles: [],
    };
  }

  const winner = ranked[0];
  const consideredProfiles = ranked.map((entry, index) => {
    const item: PriceResolution['consideredProfiles'][number] = {
      profileId: entry.profile.id,
      profileName: entry.profile.name,
      computedPrice: entry.computedPrice,
      rank: index + 1,
    };
    if (index > 0) {
      item.eliminatedBecause = describeLoss(winner, entry);
    }
    return item;
  });

  return {
    customerId,
    productId,
    basePrice: product.basePrice,
    finalPrice: winner.computedPrice,
    profileId: winner.profile.id,
    profileName: winner.profile.name,
    reason: explainWinner(winner, ranked),
    consideredProfiles,
  };
}

export function previewPrices(
  productIds: string[],
  input: Omit<CalculationInput, 'basePrice'>,
) {
  return productIds.map((id) => {
    const product = getProduct(id);
    const newPrice = calculatePrice({ basePrice: product.basePrice, ...input });
    return {
      productId: product.id,
      sku: product.sku,
      title: product.title,
      basePrice: product.basePrice,
      newPrice,
    };
  });
}
