-- Drop the overly permissive SELECT policy
DROP POLICY "Birthday reservations are publicly readable" ON public.kockabarlang_szulinapok;

-- Create a view exposing only non-sensitive columns (security definer = owner, bypasses RLS)
CREATE VIEW public.kockabarlang_szulinapok_availability AS
  SELECT id, date, time
  FROM public.kockabarlang_szulinapok;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.kockabarlang_szulinapok_availability TO anon, authenticated;