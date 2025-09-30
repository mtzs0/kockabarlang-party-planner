-- Enable pg_net extension for making HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to forward new birthday reservations to webhook
CREATE OR REPLACE FUNCTION public.forward_birthday_reservation_to_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reservation_json jsonb;
BEGIN
  -- Convert the new row to JSON
  reservation_json := to_jsonb(NEW);
  
  -- Make async HTTP request to the edge function
  PERFORM net.http_post(
    url := 'https://bftehfkjevtofacaiwxu.supabase.co/functions/v1/webhook-forwarder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdGVoZmtqZXZ0b2ZhY2Fpd3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTAwOTksImV4cCI6MjA3NDcyNjA5OX0.l0dFAnxx04ovJI2BOtYO7S94X5NKev7Setyoct_ascU"}'::jsonb,
    body := reservation_json::jsonb
  );
  
  -- Always return NEW to allow the insert to complete
  RETURN NEW;
END;
$$;

-- Create trigger to call the function after INSERT
DROP TRIGGER IF EXISTS trigger_forward_birthday_reservation ON public.kockabarlang_szulinapok;

CREATE TRIGGER trigger_forward_birthday_reservation
  AFTER INSERT ON public.kockabarlang_szulinapok
  FOR EACH ROW
  EXECUTE FUNCTION public.forward_birthday_reservation_to_webhook();