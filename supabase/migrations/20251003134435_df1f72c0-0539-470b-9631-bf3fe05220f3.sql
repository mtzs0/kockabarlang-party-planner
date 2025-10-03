-- Change time column to text to store time brackets
ALTER TABLE public.kockabarlang_szulinapok 
ALTER COLUMN time TYPE text;