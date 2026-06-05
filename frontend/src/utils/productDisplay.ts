import type { Product } from '../api';

/** Display pack size until catalogue API exposes it explicitly. */
export function packSizeFor(product: Product): string {
  if (product.segment.toLowerCase().includes('wine')) return '12 × 750ml';
  return '6 × 750ml';
}

export function productInitials(product: Product): string {
  return product.brand
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function thumbnailHue(product: Product): string {
  let hash = 0;
  for (let i = 0; i < product.brand.length; i++) {
    hash = product.brand.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 88%)`;
}
