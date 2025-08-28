-- Create birthday themes table
CREATE TABLE public.kockabarlang_szulinapthemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT
);

-- Create birthday parties table
CREATE TABLE public.kockabarlang_szulinapok (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  theme TEXT NOT NULL,
  child TEXT NOT NULL,
  parent TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  birthday DATE NOT NULL,
  message TEXT
);

-- Create reservations table for blocked timeslots
CREATE TABLE public.kockabarlang_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.kockabarlang_szulinapthemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kockabarlang_szulinapok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kockabarlang_reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for themes (publicly readable)
CREATE POLICY "Themes are publicly readable" 
ON public.kockabarlang_szulinapthemes 
FOR SELECT 
USING (true);

-- Create policies for birthday parties (public can create, staff can view)
CREATE POLICY "Public can create birthday party reservations" 
ON public.kockabarlang_szulinapok 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can view birthday party reservations" 
ON public.kockabarlang_szulinapok 
FOR SELECT 
USING (is_staff_member(auth.uid()));

-- Create policies for reservations (publicly readable for availability checking)
CREATE POLICY "Reservations are publicly readable" 
ON public.kockabarlang_reservations 
FOR SELECT 
USING (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_kockabarlang_szulinapthemes_updated_at
BEFORE UPDATE ON public.kockabarlang_szulinapthemes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kockabarlang_szulinapok_updated_at
BEFORE UPDATE ON public.kockabarlang_szulinapok
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kockabarlang_reservations_updated_at
BEFORE UPDATE ON public.kockabarlang_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample themes
INSERT INTO public.kockabarlang_szulinapthemes (name, description, image) VALUES
('Hercegnős', 'Rózsaszín kastély, hercegnők és lovagok varázslatos világa', 'https://example.com/hercegnos.jpg'),
('Kalóz kaland', 'Tengeri kalózok és kincskeresés izgalmas története', 'https://example.com/kaloz.jpg'),
('Szuperhős', 'Marvel és DC szuperhősök fantasztikus világa', 'https://example.com/szuperhos.jpg'),
('Állatkert', 'Vadállatok és háziállatok kedves birodalma', 'https://example.com/allatkert.jpg'),
('Tündérmese', 'Klasszikus tündérmesék bájos karakterei', 'https://example.com/tundermese.jpg'),
('Űrkaland', 'Bolygók, űrhajók és űrlények kalandjai', 'https://example.com/urkaland.jpg');