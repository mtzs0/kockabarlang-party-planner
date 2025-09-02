-- Fix the validate_service_ids function to have proper search path
CREATE OR REPLACE FUNCTION public.validate_service_ids()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Check if all service_ids exist in nyirok_services
  IF NEW.service_ids IS NOT NULL AND array_length(NEW.service_ids, 1) > 0 THEN
    IF EXISTS (
      SELECT 1 
      FROM unnest(NEW.service_ids) AS service_id 
      WHERE service_id NOT IN (SELECT id FROM public.nyirok_services)
    ) THEN
      RAISE EXCEPTION 'Invalid service_id in service_ids array';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;