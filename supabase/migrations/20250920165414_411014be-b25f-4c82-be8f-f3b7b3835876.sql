-- Add test data for kockabarlang_reservations to test time slot availability
INSERT INTO public.kockabarlang_reservations (id, start_date, end_date, start_time, end_time, type)
VALUES 
  -- Example 1: Reservation from Aug 28 to Sep 15, blocking 9:00-11:00 daily
  (gen_random_uuid(), '2025-08-28', '2025-09-15', '09:00:00', '11:00:00', 'maintenance'),
  
  -- Example 2: Weekend reservation blocking 14:00-16:00
  (gen_random_uuid(), '2025-01-18', '2025-01-19', '14:00:00', '16:00:00', 'event'),
  
  -- Example 3: Single day reservation blocking 12:00-13:00
  (gen_random_uuid(), '2025-01-25', '2025-01-25', '12:00:00', '13:00:00', 'private_event'),
  
  -- Example 4: Multi-week reservation blocking morning hours
  (gen_random_uuid(), '2025-02-01', '2025-02-14', '09:00:00', '12:00:00', 'renovation');

-- Add test birthday party reservation for specific time
INSERT INTO public.kockabarlang_szulinapok (id, date, time, birthday, theme, child, parent, phone, email)
VALUES 
  (gen_random_uuid(), '2025-01-25', '15:00:00', '2025-01-25', 'Pirates', 'Test Child', 'Test Parent', '+36301234567', 'test@example.com');