-- Fix security warnings

-- 1. Recreate the function with proper search_path
CREATE OR REPLACE FUNCTION public.forward_birthday_reservation_to_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 2. Move pg_net extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;