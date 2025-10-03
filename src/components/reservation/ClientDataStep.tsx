import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientData {
  parentName: string;
  childName: string;
  childBirthday: string;
  phone: string;
  email: string;
  message: string;
  invoice: string;
  acceptedPolicy: boolean;
}

interface ClientDataErrors {
  parentName?: string;
  childName?: string;
  childBirthday?: string;
  phone?: string;
  email?: string;
  message?: string;
  invoice?: string;
  acceptedPolicy?: string;
}

interface ClientDataStepProps {
  data: ClientData;
  onDataSubmit: (data: ClientData) => void;
}

export const ClientDataStep = ({ data, onDataSubmit }: ClientDataStepProps) => {
  const [formData, setFormData] = useState<ClientData>(data);
  const [errors, setErrors] = useState<ClientDataErrors>({});

  const handleInputChange = (field: keyof ClientData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBirthdayChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleInputChange('childBirthday', formattedDate);
    } else {
      handleInputChange('childBirthday', '');
    }
  };

  const validateForm = () => {
    const newErrors: ClientDataErrors = {};

    if (!formData.parentName.trim()) {
      newErrors.parentName = "A szülő neve kötelező";
    }

    if (!formData.childName.trim()) {
      newErrors.childName = "A gyerek neve kötelező";
    }

    if (!formData.childBirthday) {
      newErrors.childBirthday = "A születési dátum kötelező";
    } else {
      // Validate date format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.childBirthday)) {
        newErrors.childBirthday = "Helyes formátum: ÉÉÉÉ-HH-NN";
      } else {
        // Validate if it's a real date
        const date = new Date(formData.childBirthday);
        if (isNaN(date.getTime()) || date > new Date()) {
          newErrors.childBirthday = "Érvénytelen vagy jövőbeli dátum";
        }
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "A telefonszám kötelező";
    } else if (!/^\+36 \d{2} \d{3} \d{4}$/.test(formData.phone)) {
      newErrors.phone = "Helyes formátum: +36 XX XXX XXXX";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Az email cím kötelező";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Érvénytelen email cím";
    }

    if (!formData.acceptedPolicy) {
      newErrors.acceptedPolicy = "Az adatkezelési tájékoztató elfogadása kötelező";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onDataSubmit(formData);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Ensure it starts with 36
    let formatted = '+36';
    
    if (digits.length > 2) {
      const remaining = digits.slice(2);
      if (remaining.length > 0) {
        formatted += ' ' + remaining.slice(0, 2);
      }
      if (remaining.length > 2) {
        formatted += ' ' + remaining.slice(2, 5);
      }
      if (remaining.length > 5) {
        formatted += ' ' + remaining.slice(5, 9);
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Adatok megadása</h2>
        <p className="text-muted-foreground">Töltsd ki az alábbi mezőket a foglalás véglegesítéséhez</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          {/* Parent Name */}
          <div>
            <Label htmlFor="parentName">Szülő neve *</Label>
            <Input
              id="parentName"
              value={formData.parentName}
              onChange={(e) => handleInputChange('parentName', e.target.value)}
              className={cn(errors.parentName && "border-destructive")}
            />
            {errors.parentName && (
              <p className="text-sm text-destructive mt-1">{errors.parentName}</p>
            )}
          </div>

          {/* Child Name */}
          <div>
            <Label htmlFor="childName">Gyerek neve *</Label>
            <Input
              id="childName"
              value={formData.childName}
              onChange={(e) => handleInputChange('childName', e.target.value)}
              className={cn(errors.childName && "border-destructive")}
            />
            {errors.childName && (
              <p className="text-sm text-destructive mt-1">{errors.childName}</p>
            )}
          </div>

          {/* Child Birthday */}
          <div>
            <Label htmlFor="childBirthday">Szülinapos gyermek születési dátuma *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.childBirthday && "text-muted-foreground",
                    errors.childBirthday && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.childBirthday ? (
                    formData.childBirthday
                  ) : (
                    <span>Válassz dátumot</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.childBirthday ? new Date(formData.childBirthday) : undefined}
                  onSelect={handleBirthdayChange}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.childBirthday && (
              <p className="text-sm text-destructive mt-1">{errors.childBirthday}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Telefonszám *</Label>
            <Input
              id="phone"
              placeholder="+36 XX XXX XXXX"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cn(errors.phone && "border-destructive")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email cím *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Invoice Address */}
          <div>
            <Label htmlFor="invoice">Számlázási cím</Label>
            <Input
              id="invoice"
              value={formData.invoice}
              onChange={(e) => handleInputChange('invoice', e.target.value)}
              placeholder="Számlázási cím (opcionális)"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Üzenet / speciális kérés</Label>
            <Textarea
              id="message"
              rows={3}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Itt írhatsz nekünk bármilyen különleges kérést..."
            />
          </div>

          {/* Policy Acceptance */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="policy"
              checked={formData.acceptedPolicy}
              onCheckedChange={(checked) => handleInputChange('acceptedPolicy', !!checked)}
              className={cn(errors.acceptedPolicy && "border-destructive")}
            />
            <Label 
              htmlFor="policy" 
              className="text-sm leading-5 cursor-pointer"
            >
              Tudomásul veszem és elfogadom az{" "}
              <a href="#" className="text-primary underline">
                Adatkezelési tájékoztatót
              </a>
              *
            </Label>
          </div>
          {errors.acceptedPolicy && (
            <p className="text-sm text-destructive">{errors.acceptedPolicy}</p>
          )}

          <Button type="submit" className="w-full mt-6">
            Tovább az összefoglalóhoz
          </Button>
        </form>
      </div>
    </div>
  );
};