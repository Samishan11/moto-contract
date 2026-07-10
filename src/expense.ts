import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

// --- Phase 8.1: expense split tracking (no payments — locked decision) ---
// --- + Phase 10.3: FX display conversion & analytics ---

/** ISO-4217 code, e.g. "NPR", "USD". */
export const CurrencyCode = z.string().regex(/^[A-Z]{3}$/);

/** Suggested categories — free-form like stop categories; "Fuel" feeds 10.3's fuel-per-km. */
export const EXPENSE_CATEGORIES = [
  'Fuel',
  'Food',
  'Accommodation',
  'Toll',
  'Maintenance',
  'Other',
] as const;

export const ExpenseSplitStatus = z.enum(['PENDING', 'SETTLED']);
export type ExpenseSplitStatus = z.infer<typeof ExpenseSplitStatus>;

export const ExpenseSplitSchema = z.object({
  id: z.string(),
  user: GroupUserSummarySchema,
  amountOwed: z.number(),
  status: ExpenseSplitStatus,
  settledAt: z.string().nullable(), // ISO-8601
});
export type ExpenseSplit = z.infer<typeof ExpenseSplitSchema>;

export const ExpenseAttachmentSchema = z.object({
  id: z.string(),
  url: z.string(), // presigned GET URL, resolved server-side
});
export type ExpenseAttachment = z.infer<typeof ExpenseAttachmentSchema>;

export const ExpenseSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  tripId: z.string().nullable(), // acceptance 8.1: expenses can belong to a trip
  createdBy: GroupUserSummarySchema.nullable(), // the payer; null if account deleted
  description: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  date: z.string(), // ISO-8601
  category: z.string(),
  splits: z.array(ExpenseSplitSchema),
  attachments: z.array(ExpenseAttachmentSchema),
  createdAt: z.string(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

/**
 * Create: either explicit `splits` (validated to sum to totalAmount) or
 * `participantIds` for an even split computed server-side (remainder cents go
 * to the first participants, so the sum is always exact).
 */
export const CreateExpenseSchema = z
  .object({
    description: z.string().min(1).max(200),
    totalAmount: z.number().positive().max(100_000_000),
    currency: CurrencyCode,
    date: z.string(), // ISO-8601
    category: z.string().min(1).max(40),
    tripId: z.string().optional(),
    splits: z
      .array(
        z.object({
          userId: z.string(),
          amountOwed: z.number().nonnegative().max(100_000_000),
        }),
      )
      .min(1)
      .optional(),
    participantIds: z.array(z.string()).min(1).optional(),
    /** objectKeys from the presign step (receipt photos). */
    attachmentKeys: z.array(z.string()).max(5).optional(),
  })
  .refine((v) => (v.splits != null) !== (v.participantIds != null), {
    message: 'Provide exactly one of splits or participantIds',
  });
export type CreateExpenseRequest = z.infer<typeof CreateExpenseSchema>;

export const UpdateExpenseSchema = z
  .object({
    description: z.string().min(1).max(200),
    date: z.string(),
    category: z.string().min(1).max(40),
    tripId: z.string().nullable(),
  })
  .partial();
export type UpdateExpenseRequest = z.infer<typeof UpdateExpenseSchema>;

// --- Balances & settlement ---

/** Net bilateral debt: `from` owes `to` `amount` in `currency`. */
export const BalancePairSchema = z.object({
  from: GroupUserSummarySchema,
  to: GroupUserSummarySchema,
  amount: z.number(),
  currency: z.string(),
});
export type BalancePair = z.infer<typeof BalancePairSchema>;

/** The caller's net position per currency: positive = others owe you. */
export const MyBalanceSchema = z.object({
  currency: z.string(),
  net: z.number(),
});
export type MyBalance = z.infer<typeof MyBalanceSchema>;

/** 10.3 — the caller's net converted to their preferred currency. Native
 * amounts stay authoritative; this is display-only. Null when FX rates are
 * unavailable or the user has no preferred currency set. */
export const ConvertedBalanceSchema = z.object({
  currency: z.string(),
  net: z.number(),
  rateDate: z.string(), // yyyy-mm-dd of the rates used
});
export type ConvertedBalance = z.infer<typeof ConvertedBalanceSchema>;

export const BalancesResponseSchema = z.object({
  pairs: z.array(BalancePairSchema),
  mine: z.array(MyBalanceSchema),
  converted: ConvertedBalanceSchema.nullable(),
});
export type BalancesResponse = z.infer<typeof BalancesResponseSchema>;

/** One payment in the optimal settlement order. */
export const SettlementStepSchema = z.object({
  from: GroupUserSummarySchema,
  to: GroupUserSummarySchema,
  amount: z.number(),
});
export type SettlementStep = z.infer<typeof SettlementStepSchema>;

export const SettlementPlanResponseSchema = z.object({
  plans: z.array(
    z.object({
      currency: z.string(),
      steps: z.array(SettlementStepSchema),
    }),
  ),
});
export type SettlementPlanResponse = z.infer<typeof SettlementPlanResponseSchema>;

// --- 10.3: group expense analytics ---

export const ExpenseStatsPeriod = z.enum(['month', 'year']);
export type ExpenseStatsPeriod = z.infer<typeof ExpenseStatsPeriod>;

export const ExpenseStatsResponseSchema = z.object({
  period: ExpenseStatsPeriod,
  /** Native totals per currency — authoritative. */
  totals: z.array(z.object({ currency: z.string(), total: z.number() })),
  byCategory: z.array(
    z.object({ category: z.string(), currency: z.string(), total: z.number() }),
  ),
  byMember: z.array(
    z.object({
      user: GroupUserSummarySchema,
      currency: z.string(),
      total: z.number(),
    }),
  ),
  /** Fuel spend over group ride distance in the period; converted to `currency`
   * (the caller's preferred, USD fallback). Null without rides or FX rates. */
  fuelPerKm: z
    .object({
      currency: z.string(),
      fuelTotal: z.number(),
      distanceKm: z.number(),
      perKm: z.number(),
    })
    .nullable(),
});
export type ExpenseStatsResponse = z.infer<typeof ExpenseStatsResponseSchema>;
