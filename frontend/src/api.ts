const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  brand: string;
  subCategory: string;
  segment: string;
  basePrice: number;
}

export interface Customer {
  id: string;
  name: string;
  groupIds: string[];
}

export interface CustomerGroup {
  id: string;
  name: string;
}

export type ProductScope =
  | { type: 'all' }
  | { type: 'segment'; value: string }
  | { type: 'subCategory'; value: string }
  | { type: 'sku'; productIds: string[] };

export type CustomerScope =
  | { type: 'group'; targetId: string }
  | { type: 'customer'; targetId: string };

export interface PricingProfile {
  id: string;
  name: string;
  customerScope: CustomerScope;
  productScope: ProductScope;
  adjustmentKind: 'calculated' | 'override';
  mode: 'fixed' | 'dynamic';
  direction: 'increase' | 'decrease';
  value: number;
  priority: number;
}

export interface PreviewLine {
  productId: string;
  sku: string;
  title: string;
  basePrice: number;
  newPrice: number;
}

export interface PriceResolution {
  customerId: string;
  productId: string;
  basePrice: number;
  finalPrice: number;
  profileId: string | null;
  profileName: string | null;
  reason: string;
  consideredProfiles: Array<{
    profileId: string;
    profileName: string;
    computedPrice: number;
    rank: number;
    eliminatedBecause?: string;
  }>;
}

export interface ProductFilters {
  title?: string;
  sku?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}

export function fetchProducts(filters: ProductFilters = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v?.trim()) q.set(k, v.trim());
  }
  const qs = q.toString();
  return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
}

export function fetchCustomers() {
  return request<Customer[]>('/customers');
}

export function fetchGroups() {
  return request<CustomerGroup[]>('/customer-groups');
}

export function fetchProfiles() {
  return request<PricingProfile[]>('/pricing-profiles');
}

export function previewPrices(body: {
  productIds: string[];
  adjustmentKind: 'calculated' | 'override';
  mode: 'fixed' | 'dynamic';
  direction: 'increase' | 'decrease';
  value: number;
}) {
  return request<PreviewLine[]>('/pricing-profiles/preview', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function createProfile(body: Omit<PricingProfile, 'id' | 'priority'> & { priority?: number }) {
  return request<PricingProfile>('/pricing-profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function resolvePrice(customerId: string, productId: string) {
  const q = new URLSearchParams({ customerId, productId });
  return request<PriceResolution>(`/resolve-price?${q}`);
}
