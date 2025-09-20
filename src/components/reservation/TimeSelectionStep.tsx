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
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

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

  useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedDate) return;
      
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

        // Process birthday party reservations
        if (birthdayReservations && birthdayReservations.length > 0) {
          console.log('🎉 Processing birthday party reservations:', birthdayReservations);
          birthdayReservations.forEach(reservation => {
            const timeStr = reservation.time;
            if (timeStr) {
              const formattedTime = formatTimeString(timeStr);
              if (formattedTime && !reserved.includes(formattedTime)) {
                reserved.push(formattedTime);
                console.log('🚫 Birthday party blocked time:', formattedTime);
              }
            }
          });
        }

        // Process ongoing reservations
        if (ongoingReservations && ongoingReservations.length > 0) {
          console.log('🏢 Processing ongoing reservations:', ongoingReservations);
          ongoingReservations.forEach(reservation => {
            const { start_time, end_time, type } = reservation;
            console.log(`📝 Processing ${type} reservation: ${start_time} - ${end_time}`);
            
            if (!start_time || !end_time) {
              console.warn('⚠️ Invalid reservation times:', reservation);
              return;
            }
            
            const startMinutes = timeToMinutes(start_time);
            const endMinutes = timeToMinutes(end_time);
            
            if (startMinutes === 0 && endMinutes === 0) {
              console.warn('⚠️ Could not parse reservation times:', start_time, end_time);
              return;
            }
            
            // Check each time slot to see if it falls within the reservation period
            timeSlots.forEach(slot => {
              const slotMinutes = timeToMinutes(slot);
              // Time slot is unavailable if it's >= start_time and < end_time
              if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
                if (!reserved.includes(slot)) {
                  reserved.push(slot);
                  console.log(`🚫 ${type} blocked time slot:`, slot, `(${startMinutes}-${endMinutes} minutes)`);
                }
              }
            });
          });
        }

        console.log('🚫 Total unavailable slots:', reserved);
        setUnavailableSlots(reserved);
      } catch (error) {
        console.error('❌ Unexpected error fetching reservations:', error);
        // Don't block the UI, just log the error
        setUnavailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [selectedDate]);

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
          <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
          {timeSlots.map((time) => {
            const isUnavailable = unavailableSlots.includes(time);
            const isSelected = selectedTime === time;
            
            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                disabled={isUnavailable}
                onClick={() => onTimeSelect(time)}
                className={cn(
                  "h-16 flex flex-col items-center justify-center transition-all duration-200 p-2",
                  "hover:scale-105 active:scale-95",
                  {
                    "bg-primary text-primary-foreground shadow-lg": isSelected,
                    "bg-muted/50 text-muted-foreground cursor-not-allowed": isUnavailable,
                  }
                )}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="text-sm font-semibold">{time}</span>
                  <span className="text-xs h-4 flex items-center justify-center">
                    {isUnavailable ? "Foglalt" : ""}
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