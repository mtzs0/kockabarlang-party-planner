

## Problem

The `kockabarlang_szulinapok` table has a public SELECT policy (`USING (true)`) exposing all 82 rows of sensitive personal data (names, emails, phones, addresses, birthdates) to any anonymous user.

The app only needs public read access to `time` and `date` columns (in `TimeSelectionStep.tsx`) to check slot availability. Inserts are already handled separately.

## Solution

1. **Create a public view** with only `date` and `time` columns (safe to expose)
2. **Drop the public SELECT policy** on the base table (blocks direct reads of PII)
3. **Update `TimeSelectionStep.tsx`** to query the new view instead of the base table

## Technical Details

### Step 1: Database migration

```sql
-- Create a view exposing only non-sensitive columns
CREATE VIEW public.kockabarlang_szulinapok_availability
WITH (security_invoker = on) AS
  SELECT id, date, time
  FROM public.kockabarlang_szulinapok;

-- Drop the overly permissive SELECT policy
DROP POLICY "Birthday reservations are publicly readable" ON public.kockabarlang_szulinapok;

-- Add a restricted SELECT policy so the view can still read
-- (security_invoker means the view runs as the calling user, 
--  but we need the anon role to read date/time via the view)
-- We'll use a service-role approach instead: grant select on the view directly
GRANT SELECT ON public.kockabarlang_szulinapok_availability TO anon, authenticated;
```

Actually, with `security_invoker = on`, the view queries run as the calling user, so we still need a SELECT policy on the base table. A better approach:

```sql
-- Drop the wide-open SELECT policy
DROP POLICY "Birthday reservations are publicly readable" ON public.kockabarlang_szulinapok;

-- Create a view WITHOUT security_invoker (defaults to security_definer = owner)
-- This means the view runs as the table owner, bypassing RLS
CREATE VIEW public.kockabarlang_szulinapok_availability AS
  SELECT id, date, time
  FROM public.kockabarlang_szulinapok;

-- Grant access to the view
GRANT SELECT ON public.kockabarlang_szulinapok_availability TO anon, authenticated;
```

This way:
- Direct queries to `kockabarlang_szulinapok` return no rows (no SELECT policy)
- Queries to the view return only `id`, `date`, `time` (safe data)
- INSERT still works via the existing INSERT policy

### Step 2: Update TimeSelectionStep.tsx

Change the query from:
```ts
.from('kockabarlang_szulinapok')
.select('time')
.eq('date', selectedDate)
```
to:
```ts
.from('kockabarlang_szulinapok_availability' as any)
.select('time')
.eq('date', selectedDate)
```

### Step 3: Mark security finding as fixed

No other code changes needed. The INSERT flow in `SummaryStep.tsx` uses `.insert().select()` — the `.select()` after insert won't return data without a SELECT policy, so we may need to remove the `.select()` or keep a limited SELECT policy. Let me check...

The `SummaryStep.tsx` does `.insert(reservationPayload).select()` and uses the returned data for logging. We should change this to just `.insert(reservationPayload)` since the returned data isn't critical (it's only logged), or add a narrow SELECT policy that allows users to read only the row they just inserted. Simplest fix: remove `.select()`.

### Summary of changes

| File | Change |
|------|--------|
| New migration | Drop public SELECT policy, create restricted view |
| `TimeSelectionStep.tsx` | Query the view instead of the base table |
| `SummaryStep.tsx` | Remove `.select()` from insert call |

