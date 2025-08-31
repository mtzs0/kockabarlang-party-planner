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
        const newValue = displayValue.slice(0, cursorPos - 1) + displayValue.slice(cursorPos);
        setDisplayValue(newValue);
        updateDisplayAndValue(newValue);
        updateCursor(cursorPos - 1);
        e.preventDefault();
      }
      return;
    }

    // Only allow numbers
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    
    // Insert digit at cursor position
    const newValue = displayValue.slice(0, cursorPos) + e.key + displayValue.slice(cursorPos);
    setDisplayValue(newValue);
    updateDisplayAndValue(newValue);

    // Auto-advance cursor logic
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
    } else if (cursorPos >= 8 && cursorPos < 10) {
      // Day section (positions 8-9)
      updateCursor(Math.min(cursorPos + 1, 10));
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