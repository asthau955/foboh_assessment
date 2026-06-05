import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { previewPrices, resolvePrice } from './priceResolver.js';
import {
  createProfileSchema,
  previewSchema,
  productFilterSchema,
  resolvePriceSchema,
  updateProfileSchema,
} from './validation.js';
import {
  AppError,
  createProfile,
  deleteProfile,
  getProfile,
  listCustomers,
  listGroups,
  listProducts,
  listProfiles,
  updateProfile,
} from './store.js';
import type { PricingProfile } from './types.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});

apiRouter.get('/products', (req, res, next) => {
  try {
    const filter = productFilterSchema.parse(req.query);
    res.json(listProducts(filter));
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/customers', (_req, res) => {
  res.json(listCustomers());
});

apiRouter.get('/customer-groups', (_req, res) => {
  res.json(listGroups());
});

apiRouter.get('/pricing-profiles', (_req, res) => {
  res.json(listProfiles());
});

apiRouter.get('/pricing-profiles/:id', (req, res, next) => {
  try {
    res.json(getProfile(req.params.id));
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/pricing-profiles', (req, res, next) => {
  try {
    const body = createProfileSchema.parse(req.body);
    const profile = createProfile({
      ...body,
      priority: body.priority ?? 0,
    } as Omit<PricingProfile, 'id' | 'createdAt' | 'updatedAt'>);
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

apiRouter.put('/pricing-profiles/:id', (req, res, next) => {
  try {
    const body = updateProfileSchema.parse(req.body);
    res.json(updateProfile(req.params.id, body));
  } catch (err) {
    next(err);
  }
});

apiRouter.delete('/pricing-profiles/:id', (req, res, next) => {
  try {
    deleteProfile(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/pricing-profiles/preview', (req, res, next) => {
  try {
    const body = previewSchema.parse(req.body);
    res.json(
      previewPrices(body.productIds, {
        adjustmentKind: body.adjustmentKind,
        mode: body.mode,
        direction: body.direction,
        value: body.value,
      }),
    );
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/resolve-price', (req, res, next) => {
  try {
    const { customerId, productId } = resolvePriceSchema.parse(req.query);
    res.json(resolvePrice(customerId, productId));
  } catch (err) {
    next(err);
  }
});

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: err.flatten() });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Unexpected server error' });
}
