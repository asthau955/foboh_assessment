import type {
  AdjustmentDirection,
  AdjustmentKind,
  AdjustmentMode,
} from './types.js';

const MONEY_DECIMALS = 2;

/** Round half-up to cents — avoids float drift on wholesale prices. */
export function roundMoney(amount: number): number {
  const factor = 10 ** MONEY_DECIMALS;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

export function clampNonNegative(price: number): number {
  return roundMoney(Math.max(0, price));
}

export interface CalculationInput {
  basePrice: number;
  adjustmentKind: AdjustmentKind;
  mode: AdjustmentMode;
  direction: AdjustmentDirection;
  value: number;
}

/**
 * Fixed calculated: Base ± Adjustment
 * Dynamic calculated: Base ± (Adjustment% × Base)
 * Override (fixed decrease): value IS the target price, not a delta
 */
export function calculatePrice(input: CalculationInput): number {
  const { basePrice, adjustmentKind, mode, direction, value } = input;

  if (adjustmentKind === 'override') {
    return clampNonNegative(value);
  }

  let delta: number;
  if (mode === 'fixed') {
    delta = value;
  } else {
    delta = roundMoney((value / 100) * basePrice);
  }

  const signed = direction === 'increase' ? delta : -delta;
  return clampNonNegative(roundMoney(basePrice + signed));
}
