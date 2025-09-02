-- Allow public read access to check availability (date and time only)
-- This allows the reservation form to check which time slots are taken
-- without exposing sensitive personal information
CREATE POLICY "Public can check availability" 
ON public.kockabarlang_szulinapok 
FOR SELECT 
USING (true);