import { z } from 'zod';

const productScopeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('all') }),
  z.object({ type: z.literal('segment'), value: z.string().min(1) }),
  z.object({ type: z.literal('subCategory'), value: z.string().min(1) }),
  z.object({
    type: z.literal('sku'),
    productIds: z.array(z.string().min(1)).min(1),
  }),
]);

const customerScopeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('group'), targetId: z.string().min(1) }),
  z.object({ type: z.literal('customer'), targetId: z.string().min(1) }),
]);

const profileBodySchema = z.object({
  name: z.string().min(1).max(120),
  customerScope: customerScopeSchema,
  productScope: productScopeSchema,
  adjustmentKind: z.enum(['calculated', 'override']).default('calculated'),
  mode: z.enum(['fixed', 'dynamic']),
  direction: z.enum(['increase', 'decrease']),
  value: z.number().nonnegative(),
  priority: z.number().int().min(0).max(1000).optional(),
});

function refineProfileBody(
  data: z.infer<typeof profileBodySchema>,
  ctx: z.RefinementCtx,
): void {
  if (data.adjustmentKind === 'override') {
    if (data.mode !== 'fixed') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Override prices must use fixed mode',
        path: ['mode'],
      });
    }
    if (data.direction !== 'decrease') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Override is expressed as a target price via decrease + fixed value',
        path: ['direction'],
      });
    }
  }
  if (data.mode === 'dynamic' && data.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Percentage cannot exceed 100',
      path: ['value'],
    });
  }
}

export const createProfileSchema = profileBodySchema.superRefine(refineProfileBody);

export const updateProfileSchema = profileBodySchema.partial().superRefine((data, ctx) => {
  if (Object.keys(data).length === 0) return;
  refineProfileBody(
    {
      name: data.name ?? 'placeholder',
      customerScope: data.customerScope ?? { type: 'group', targetId: 'x' },
      productScope: data.productScope ?? { type: 'all' },
      adjustmentKind: data.adjustmentKind ?? 'calculated',
      mode: data.mode ?? 'fixed',
      direction: data.direction ?? 'decrease',
      value: data.value ?? 0,
      priority: data.priority,
    },
    ctx,
  );
});

export const previewSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1),
  adjustmentKind: z.enum(['calculated', 'override']).default('calculated'),
  mode: z.enum(['fixed', 'dynamic']),
  direction: z.enum(['increase', 'decrease']),
  value: z.number().nonnegative(),
});

export const resolvePriceSchema = z.object({
  customerId: z.string().min(1),
  productId: z.string().min(1),
});

export const productFilterSchema = z.object({
  title: z.string().optional(),
  sku: z.string().optional(),
  subCategory: z.string().optional(),
  segment: z.string().optional(),
  brand: z.string().optional(),
});
