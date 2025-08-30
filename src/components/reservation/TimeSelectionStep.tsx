import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSelectionStepProps {
  selectedTime: string;
  selectedDate: string;
  onTimeSelect: (time: string) => void;
}

export const TimeSelectionStep = ({ selectedTime, selectedDate, onTimeSelect }: TimeSelectionStepProps) => {
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // Mock availability - in real app this would come from database
  const unavailableSlots = ["12:00", "15:00"]; // Example blocked slots

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