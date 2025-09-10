import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MaskedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
}

export const MaskedDateInput = ({ 
  value, 
  onChange, 
  className, 
  placeholder = "év-hónap-nap",
  id 
}: MaskedDateInputProps) => {
  const [displayValue, setDisplayValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize display value from prop value
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setDisplayValue(`${parts[0]}-${parts[1]}-${parts[2]}`);
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const updateCursor = (position: number) => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current!.setSelectionRange(position, position);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPos = input.selectionStart || 0;
    
    // Allow navigation keys
    if (['ArrowLeft', 'ArrowRight', 'Tab', 'Backspace', 'Delete'].includes(e.key)) {
      if (e.key === 'Backspace' && cursorPos > 0) {
        e.preventDefault();
        let newValue = displayValue;
        let newCursorPos = cursorPos - 1;
        
        // Handle backspace in day section specially
        if (cursorPos >= 9 && cursorPos <= 10) {
          const dayPart = displayValue.slice(8, 10);
          if (dayPart.length === 2 && cursorPos === 10) {
            // Going from 2 digits to 1 digit - format as 0X
            const firstDigit = dayPart[0];
            newValue = displayValue.slice(0, 8) + '0' + firstDigit;
            newCursorPos = 9;
          } else if (cursorPos === 9) {
            // Remove the single digit in day section
            newValue = displayValue.slice(0, 8);
            newCursorPos = 8;
          }
        } else {
          // Normal backspace behavior for other sections
          newValue = displayValue.slice(0, cursorPos - 1) + displayValue.slice(cursorPos);
        }
        
        setDisplayValue(newValue);
        updateDisplayAndValue(newValue);
        updateCursor(newCursorPos);
      }
      return;
    }

    // Only allow numbers
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    
    // Handle day section specially (positions 8-9)
    if (cursorPos >= 8 && cursorPos < 10) {
      const dayStart = 8;
      const currentDayPart = displayValue.slice(dayStart, 10);
      
      if (cursorPos === 8) {
        // First digit of day - format as 0X
        const newDayValue = '0' + e.key;
        const newValue = displayValue.slice(0, dayStart) + newDayValue;
        setDisplayValue(newValue);
        updateDisplayAndValue(newValue);
        updateCursor(9);
      } else if (cursorPos === 9 && currentDayPart.length === 2) {
        // Second digit of day - replace the second digit
        const newDayValue = currentDayPart[0] + e.key;
        const newValue = displayValue.slice(0, dayStart) + newDayValue;
        setDisplayValue(newValue);
        updateDisplayAndValue(newValue);
        updateCursor(10);
      }
      return;
    }
    
    // Insert digit at cursor position for other sections
    const newValue = displayValue.slice(0, cursorPos) + e.key + displayValue.slice(cursorPos);
    setDisplayValue(newValue);
    updateDisplayAndValue(newValue);

    // Auto-advance cursor logic for year and month sections
    if (cursorPos < 4) {
      // Year section (positions 0-3)
      const newPos = cursorPos + 1;
      if (newPos === 4) {
        // Jump to month section after 4th digit
        updateCursor(5);
      } else {
        updateCursor(newPos);
      }
    } else if (cursorPos === 4) {
      // Add dash after year and move to month
      const valueWithDash = newValue.slice(0, 4) + '-' + newValue.slice(4);
      setDisplayValue(valueWithDash);
      updateDisplayAndValue(valueWithDash);
      updateCursor(6);
    } else if (cursorPos >= 5 && cursorPos < 7) {
      // Month section (positions 5-6)
      const monthStart = 5;
      const monthDigits = newValue.slice(monthStart, 7).replace(/\D/g, '');
      
      if (monthDigits.length === 2) {
        // Jump to day section after 2nd month digit
        const valueWithDash = newValue.slice(0, 7) + '-' + newValue.slice(7);
        setDisplayValue(valueWithDash);
        updateDisplayAndValue(valueWithDash);
        updateCursor(9);
      } else {
        updateCursor(cursorPos + 1);
      }
    } else if (cursorPos === 7) {
      // Add dash after month and move to day
      const valueWithDash = newValue.slice(0, 7) + '-' + newValue.slice(7);
      setDisplayValue(valueWithDash);
      updateDisplayAndValue(valueWithDash);
      updateCursor(9);
    }
  };

  const updateDisplayAndValue = (newDisplayValue: string) => {
    // Extract only the numeric parts for the actual value
    const parts = newDisplayValue.split('-');
    if (parts.length === 3 && parts[0].length === 4 && parts[1].length > 0 && parts[2].length > 0) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const clickPos = input.selectionStart || 0;
    
    // Snap cursor to appropriate section
    if (clickPos <= 4) {
      // Year section
      updateCursor(Math.min(clickPos, 4));
    } else if (clickPos <= 7) {
      // Month section
      updateCursor(Math.max(clickPos, 5));
    } else {
      // Day section
      updateCursor(Math.max(clickPos, 8));
    }
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      value={displayValue}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      maxLength={10}
      className={cn("font-mono", className)}
      readOnly
    />
  );
};