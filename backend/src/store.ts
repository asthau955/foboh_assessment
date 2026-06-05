import type {
  Customer,
  CustomerGroup,
  PricingProfile,
  Product,
} from './types.js';
import { seedCatalogue, seedProfiles } from './seed.js';

const products = new Map<string, Product>();
const groups = new Map<string, CustomerGroup>();
const customers = new Map<string, Customer>();
const profiles = new Map<string, PricingProfile>();

let seeded = false;

export function ensureSeeded(): void {
  if (seeded) return;
  for (const p of seedCatalogue()) products.set(p.id, p);
  for (const g of seedGroups()) groups.set(g.id, g);
  for (const c of seedCustomers()) customers.set(c.id, c);
  for (const profile of seedProfiles()) profiles.set(profile.id, profile);
  seeded = true;
}

function seedGroups(): CustomerGroup[] {
  return [
    { id: 'grp-independent', name: 'Independent Retailers' },
    { id: 'grp-vip', name: 'VIP' },
  ];
}

function seedCustomers(): Customer[] {
  return [
    {
      id: 'cust-bondi',
      name: 'Bondi Cellars',
      groupIds: ['grp-independent', 'grp-vip'],
    },
    {
      id: 'cust-generic-indie',
      name: 'Harbour Bottle Shop',
      groupIds: ['grp-independent'],
    },
    {
      id: 'cust-generic-vip',
      name: 'Premium Pour Co',
      groupIds: ['grp-vip'],
    },
  ];
}

export function listProducts(filter?: {
  title?: string;
  sku?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}): Product[] {
  ensureSeeded();
  let list = [...products.values()];
  if (!filter) return list;

  const contains = (hay: string, needle?: string) =>
    !needle || hay.toLowerCase().includes(needle.toLowerCase());

  return list.filter(
    (p) =>
      contains(p.title, filter.title) &&
      contains(p.sku, filter.sku) &&
      contains(p.subCategory, filter.subCategory) &&
      contains(p.segment, filter.segment) &&
      contains(p.brand, filter.brand),
  );
}

export function getProduct(id: string): Product {
  ensureSeeded();
  const p = products.get(id);
  if (!p) throw new AppError(404, 'PRODUCT_NOT_FOUND', `Product ${id} not found`);
  return p;
}

export function listGroups(): CustomerGroup[] {
  ensureSeeded();
  return [...groups.values()];
}

export function listCustomers(): Customer[] {
  ensureSeeded();
  return [...customers.values()];
}

export function getCustomer(id: string): Customer {
  ensureSeeded();
  const c = customers.get(id);
  if (!c) throw new AppError(404, 'CUSTOMER_NOT_FOUND', `Customer ${id} not found`);
  return c;
}

export function listProfiles(): PricingProfile[] {
  ensureSeeded();
  return [...profiles.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getProfile(id: string): PricingProfile {
  ensureSeeded();
  const p = profiles.get(id);
  if (!p) throw new AppError(404, 'PROFILE_NOT_FOUND', `Profile ${id} not found`);
  return p;
}

export function createProfile(
  input: Omit<PricingProfile, 'id' | 'createdAt' | 'updatedAt'>,
): PricingProfile {
  ensureSeeded();
  const now = new Date().toISOString();
  const profile: PricingProfile = {
    ...input,
    id: `prof-${crypto.randomUUID()}`,
    priority: input.priority ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(profile.id, profile);
  return profile;
}

export function updateProfile(
  id: string,
  patch: Partial<Omit<PricingProfile, 'id' | 'createdAt'>>,
): PricingProfile {
  const existing = getProfile(id);
  const updated: PricingProfile = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  profiles.set(id, updated);
  return updated;
}

export function deleteProfile(id: string): void {
  if (!profiles.delete(id)) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', `Profile ${id} not found`);
  }
}

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
