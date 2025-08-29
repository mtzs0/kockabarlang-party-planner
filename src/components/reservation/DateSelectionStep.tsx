import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateSelectionStepProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const DateSelectionStep = ({ selectedDate, onDateSelect }: DateSelectionStepProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    
    // Find the first Monday of the week containing the first day
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(firstDay.getDate() + mondayOffset);

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = day.getMonth() === month;
      const isPast = day < today;
      const isToday = day.getTime() === today.getTime();
      const isSelected = selectedDate === day.toISOString().split('T')[0];
      
      days.push({
        date: day,
        day: day.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        isSelectable: !isPast,
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    onDateSelect(dateString);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];
  const weekDays = ['Hé', 'Ke', 'Sze', 'Cs', 'Pé', 'Szo', 'Va'];

  return (
    <div className="h-full flex flex-col p-2">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-foreground mb-1">Válassz dátumot</h2>
        <p className="text-xs text-muted-foreground">Kattints a kívánt napra a foglaláshoz</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="p-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="p-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-y-auto">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day.isSelectable && handleDateClick(day.date)}
              disabled={!day.isSelectable}
              className={cn(
                "h-8 w-full flex items-center justify-center text-xs rounded transition-all duration-200",
                "hover:scale-105 active:scale-95",
                {
                  "text-muted-foreground": !day.isCurrentMonth,
                  "text-foreground": day.isCurrentMonth && day.isSelectable,
                  "text-muted-foreground/50 cursor-not-allowed": day.isPast,
                  "bg-calendar-available text-secondary-foreground font-semibold shadow-md": day.isSelected,
                  "bg-calendar-selected text-primary-foreground font-semibold": day.isToday && !day.isSelected,
                  "hover:bg-muted": day.isSelectable && !day.isSelected,
                  "cursor-pointer": day.isSelectable,
                }
              )}
            >
              {day.day}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-3 p-2 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Kiválasztott dátum:</p>
          <p className="text-sm font-semibold text-foreground">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
      )}
    </div>
  );
};