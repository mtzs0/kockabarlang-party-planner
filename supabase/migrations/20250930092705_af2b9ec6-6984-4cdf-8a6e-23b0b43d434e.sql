-- Create timeslots table
CREATE TABLE public.timeslots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL,
  timeslot TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Timeslots are publicly readable" 
ON public.timeslots 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_timeslots_updated_at
BEFORE UPDATE ON public.timeslots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the timeslots data
INSERT INTO public.timeslots (day, timeslot) VALUES
-- Monday
('monday', '10:00-13:00'),
('monday', '14:00-17:00'),
-- Tuesday  
('tuesday', '14:00-17:00'),
-- Wednesday
('wednesday', '14:00-17:00'),
-- Thursday
('thursday', '10:00-13:00'),
('thursday', '14:00-17:00'),
-- Friday
('friday', '10:00-13:00'),
-- Saturday
('saturday', '12:00-15:00'),
('saturday', '15:30-18:30'),
-- Sunday
('sunday', '10:00-13:00'),
('sunday', '14:00-17:00');