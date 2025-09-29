-- Create the birthday party themes table
CREATE TABLE public.kockabarlang_szulinapthemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the birthday party reservations table
CREATE TABLE public.kockabarlang_szulinapok (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  theme TEXT NOT NULL,
  child TEXT NOT NULL,
  parent TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  birthday DATE NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the general reservations table
CREATE TABLE public.kockabarlang_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.kockabarlang_szulinapthemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kockabarlang_szulinapok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kockabarlang_reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for themes (publicly readable, admin writable)
CREATE POLICY "Themes are publicly readable" ON public.kockabarlang_szulinapthemes
  FOR SELECT USING (true);

-- Create RLS policies for birthday reservations (publicly writable for bookings)
CREATE POLICY "Birthday reservations are publicly readable" ON public.kockabarlang_szulinapok
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create birthday reservations" ON public.kockabarlang_szulinapok
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for general reservations (publicly readable for availability checks)
CREATE POLICY "General reservations are publicly readable" ON public.kockabarlang_reservations
  FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.kockabarlang_szulinapthemes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_birthday_reservations_updated_at
  BEFORE UPDATE ON public.kockabarlang_szulinapok
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.kockabarlang_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample themes
INSERT INTO public.kockabarlang_szulinapthemes (name, description, image) VALUES
('Hercegnős', 'Varázslatos hercegnős téma rózsaszín dekorációval és tiarákkal', ''),
('Autós', 'Izgalmas autóverseny téma pályával és játékautókkal', ''),
('Állatos', 'Vidám állatos téma különböző állatfigurákkal', ''),
('Tündéres', 'Mesés tündér téma varázspálcákkal és csillogó dekorációval', ''),
('Kalózos', 'Kalandos kalóz téma kincsesládával és térképekkel', ''),
('Szuperhős', 'Akcióban gazdag szuperhős téma maszkok és köpenyekkel', ''),
('Egyszarvús', 'Színes egyszarvú téma szivárvánnyal és csillogással', ''),
('Dinoszaurusz', 'Őskori dinoszaurusz téma régészeti kalandokkal', '');