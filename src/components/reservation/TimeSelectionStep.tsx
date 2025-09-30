import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TimeSelectionStepProps {
  selectedTime: string;
  selectedDate: string;
  onTimeSelect: (time: string) => void;
}

export const TimeSelectionStep = ({ selectedTime, selectedDate, onTimeSelect }: TimeSelectionStepProps) => {
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Robust time format handling utility
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== 'string') {
      console.warn('Invalid time string:', timeStr);
      return 0;
    }
    
    // Handle both "HH:mm" and "HH:mm:ss" formats
    const timeParts = timeStr.split(':');
    if (timeParts.length < 2) {
      console.warn('Invalid time format:', timeStr);
      return 0;
    }
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn('Invalid time numbers:', timeStr);
      return 0;
    }
    
    return hours * 60 + minutes;
  };

  const formatTimeString = (timeStr: string): string => {
    if (!timeStr) return '';
    // Extract HH:mm from various time formats
    return timeStr.slice(0, 5);
  };

  // Helper function to check if time ranges overlap
  const isTimeRangeOverlapping = (range1Start: string, range1End: string, range2Start: string, range2End: string): boolean => {
    const range1StartMin = timeToMinutes(range1Start);
    const range1EndMin = timeToMinutes(range1End);
    const range2StartMin = timeToMinutes(range2Start);
    const range2EndMin = timeToMinutes(range2End);
    
    return range1StartMin < range2EndMin && range1EndMin > range2StartMin;
  };

  // Helper function to parse time range string (e.g., "10:00-13:00")
  const parseTimeRange = (timeRange: string): { start: string; end: string } | null => {
    const parts = timeRange.split('-');
    if (parts.length === 2) {
      return { start: parts[0].trim(), end: parts[1].trim() };
    }
    return null;
  };

  // Fetch available time slots based on the day of the week
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) return;
      
      // Get the day of the week from the selected date
      const date = new Date(selectedDate + 'T00:00:00');
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      console.log('🔍 Fetching time slots for day:', dayOfWeek);
      
      try {
        const { data: timeSlotsData, error } = await supabase
          .from('timeslots')
          .select('timeslot')
          .eq('day', dayOfWeek);

        if (error) {
          console.error('❌ Error fetching time slots:', error);
          setTimeSlots([]);
          return;
        }

        const slots = timeSlotsData?.map(slot => slot.timeslot) || [];
        console.log('📅 Available time slots for', dayOfWeek, ':', slots);
        setTimeSlots(slots);
      } catch (error) {
        console.error('❌ Unexpected error fetching time slots:', error);
        setTimeSlots([]);
      }
    };

    fetchTimeSlots();
  }, [selectedDate]);

  // Fetch reservations and check availability
  useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedDate || timeSlots.length === 0) return;
      
      setLoading(true);
      console.log('🔍 Fetching reservations for date:', selectedDate);
      
      try {
        // Fetch birthday party reservations for the specific date
        const { data: birthdayReservations, error: birthdayError } = await supabase
          .from('kockabarlang_szulinapok')
          .select('time')
          .eq('date', selectedDate);

        if (birthdayError) {
          console.error('❌ Error fetching birthday reservations:', birthdayError);
          return;
        }

        // Fetch ongoing reservations that might overlap with the selected date
        const { data: ongoingReservations, error: ongoingError } = await supabase
          .from('kockabarlang_reservations')
          .select('start_date, end_date, start_time, end_time, type')
          .lte('start_date', selectedDate) // start_date <= selectedDate
          .gte('end_date', selectedDate);  // end_date >= selectedDate

        if (ongoingError) {
          console.error('❌ Error fetching ongoing reservations:', ongoingError);
          return;
        }

        console.log('📅 Birthday reservations found:', birthdayReservations?.length || 0);
        console.log('🏢 Ongoing reservations found:', ongoingReservations?.length || 0);

        const reserved: string[] = [];

        // Process birthday party reservations (these block exact time slots)
        if (birthdayReservations && birthdayReservations.length > 0) {
          console.log('🎉 Processing birthday party reservations:', birthdayReservations);
          birthdayReservations.forEach(reservation => {
            const timeStr = reservation.time;
            if (timeStr) {
              const formattedTime = formatTimeString(timeStr);
              // Find which time range this birthday party falls into
              timeSlots.forEach(slot => {
                const range = parseTimeRange(slot);
                if (range) {
                  const timeMinutes = timeToMinutes(formattedTime);
                  const rangeStartMinutes = timeToMinutes(range.start);
                  const rangeEndMinutes = timeToMinutes(range.end);
                  
                  if (timeMinutes >= rangeStartMinutes && timeMinutes < rangeEndMinutes) {
                    if (!reserved.includes(slot)) {
                      reserved.push(slot);
                      console.log('🚫 Birthday party blocked time range:', slot, 'due to reservation at', formattedTime);
                    }
                  }
                }
              });
            }
          });
        }

        // Process ongoing reservations (these can overlap with time ranges)
        if (ongoingReservations && ongoingReservations.length > 0) {
          console.log('🏢 Processing ongoing reservations:', ongoingReservations);
          ongoingReservations.forEach(reservation => {
            const { start_time, end_time, type } = reservation;
            console.log(`📝 Processing ${type} reservation: ${start_time} - ${end_time}`);
            
            if (!start_time || !end_time) {
              console.warn('⚠️ Invalid reservation times:', reservation);
              return;
            }
            
            const startTime = formatTimeString(start_time);
            const endTime = formatTimeString(end_time);
            
            // Check each time slot range to see if it overlaps with the reservation
            timeSlots.forEach(slot => {
              const range = parseTimeRange(slot);
              if (range && isTimeRangeOverlapping(range.start, range.end, startTime, endTime)) {
                if (!reserved.includes(slot)) {
                  reserved.push(slot);
                  console.log(`🚫 ${type} blocked time range:`, slot, `due to overlap with ${startTime}-${endTime}`);
                }
              }
            });
          });
        }

        console.log('🚫 Total unavailable slots:', reserved);
        setUnavailableSlots(reserved);
      } catch (error) {
        console.error('❌ Unexpected error fetching reservations:', error);
        setUnavailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [selectedDate, timeSlots]);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Válassz időpontot</h2>
        <p className="text-sm text-muted-foreground">Elérhető időpontok erre a napra:</p>
        {selectedDate && (
          <p className="text-xs font-medium text-primary mt-1">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        )}
      </div>

      {/* Time Slots */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center text-muted-foreground">
            <p>Időpontok betöltése...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
          {timeSlots.map((timeRange) => {
            const isUnavailable = unavailableSlots.includes(timeRange);
            const isSelected = selectedTime === timeRange;
            
            return (
              <Button
                key={timeRange}
                variant={isSelected ? "default" : "outline"}
                disabled={isUnavailable}
                onClick={() => onTimeSelect(timeRange)}
                className={cn(
                  "h-16 flex flex-col items-center justify-center transition-all duration-200 p-4",
                  "hover:scale-105 active:scale-95",
                  {
                    "bg-primary text-primary-foreground shadow-lg": isSelected,
                    "bg-muted/50 text-muted-foreground cursor-not-allowed": isUnavailable,
                  }
                )}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-lg font-semibold">{timeRange}</span>
                  <span className="text-xs h-4 flex items-center justify-center">
                    {isUnavailable ? "Foglalt" : "Elérhető"}
                  </span>
                </div>
              </Button>
            );
          })}
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="mt-3 p-2 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Kiválasztott időpont:</p>
          <p className="text-sm font-semibold text-foreground">{selectedTime}</p>
        </div>
      )}
    </div>
  );
};