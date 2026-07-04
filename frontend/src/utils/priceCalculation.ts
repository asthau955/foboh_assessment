export type AdjustmentMode = 'fixed' | 'dynamic';
export type AdjustmentDirection = 'increase' | 'decrease';

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function clampNonNegative(price: number): number {
  return roundMoney(Math.max(0, price));
}

export function calculateAdjustedPrice(
  basePrice: number,
  mode: AdjustmentMode,
  direction: AdjustmentDirection,
  value: number,
): number {
  const delta = mode === 'fixed' ? value : roundMoney((value / 100) * basePrice);
  const signed = direction === 'increase' ? delta : -delta;
  return clampNonNegative(roundMoney(basePrice + signed));
}

export function signedAdjustment(
  direction: AdjustmentDirection,
  value: number,
): number {
  const magnitude = Math.abs(value);
  return direction === 'increase' ? magnitude : -magnitude;
}

export function newPriceFromSignedAdjustment(
  basePrice: number,
  mode: AdjustmentMode,
  signedValue: number,
): number {
  if (mode === 'fixed') {
    return clampNonNegative(roundMoney(basePrice + signedValue));
  }
  return clampNonNegative(roundMoney(basePrice + (signedValue / 100) * basePrice));
}
