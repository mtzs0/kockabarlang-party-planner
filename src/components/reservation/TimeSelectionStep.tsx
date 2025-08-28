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
    <div className="h-full flex flex-col p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Válassz időpontot</h2>
        <p className="text-muted-foreground">Elérhető időpontok erre a napra:</p>
        {selectedDate && (
          <p className="text-sm font-medium text-primary mt-1">
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
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
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
                  "h-16 flex flex-col items-center justify-center transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  {
                    "bg-primary text-primary-foreground shadow-lg": isSelected,
                    "bg-muted/50 text-muted-foreground cursor-not-allowed": isUnavailable,
                  }
                )}
              >
                <Clock className="w-4 h-4 mb-1" />
                <span className="font-semibold">{time}</span>
                {isUnavailable && (
                  <span className="text-xs text-muted-foreground">Foglalt</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {selectedTime && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Kiválasztott időpont:</p>
          <p className="font-semibold text-foreground">{selectedTime}</p>
        </div>
      )}
    </div>
  );
};