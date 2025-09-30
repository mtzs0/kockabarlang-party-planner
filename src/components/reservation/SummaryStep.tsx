import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Palette, User, Phone, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReservationData } from "../BirthdayReservationForm";

interface SummaryStepProps {
  data: ReservationData;
  onConfirm: () => void;
}

export const SummaryStep = ({ data, onConfirm }: SummaryStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      const reservationData = {
        date: data.date,
        time: data.time,
        theme: data.theme,
        child: data.childName,
        parent: data.parentName,
        phone: data.phone,
        email: data.email,
        birthday: data.childBirthday,
        message: data.message || null,
      };

      const { error } = await supabase
        .from('kockabarlang_szulinapok')
        .insert(reservationData);

      if (error) throw error;

      // Send data to webhook
      try {
        await fetch('https://n.dakexpo.hu/webhook-test/a243f7a5-3363-474c-9d06-569a1361daf1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservationData),
        });
      } catch (webhookError) {
        console.error('Error sending to webhook:', webhookError);
        // Don't fail the reservation if webhook fails
      }

      onConfirm();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Hiba történt",
        description: "A foglalás során hiba történt. Kérjük próbáld újra!",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatBirthday = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Foglalás összefoglaló</h2>
        <p className="text-muted-foreground">Ellenőrizd az adatokat és erősítsd meg a foglalást</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {/* Reservation Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              Foglalás részletei
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Dátum:</span>
                <span className="ml-auto text-sm">{formatDate(data.date)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Időpont:</span>
                <span className="ml-auto text-sm">{data.time}</span>
              </div>
              
              <div className="flex items-center">
                <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Téma:</span>
                <span className="ml-auto text-sm">{data.theme}</span>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-primary" />
              Kapcsolattartó adatok
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Szülő neve:</span>
                <span className="ml-auto text-sm">{data.parentName}</span>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Telefon:</span>
                <span className="ml-auto text-sm">{data.phone}</span>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Email:</span>
                <span className="ml-auto text-sm">{data.email}</span>
              </div>
            </div>
          </Card>

          {/* Child Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-primary" />
              Szülinapos gyermek
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Név:</span>
                <span className="ml-auto text-sm">{data.childName}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Születés:</span>
                <span className="ml-auto text-sm">{formatBirthday(data.childBirthday)}</span>
              </div>
            </div>
          </Card>

          {/* Message */}
          {data.message && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                Üzenet
              </h3>
              <p className="text-sm text-muted-foreground">{data.message}</p>
            </Card>
          )}

          {/* Policy Confirmation */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm text-primary">
                Adatkezelési tájékoztató elfogadva
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="mt-6 pt-4 border-t">
        <Button 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-3 text-lg font-semibold"
        >
          {isSubmitting ? "Foglalás rögzítése..." : "Foglalás véglegesítése"}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center mt-3">
          A foglalás véglegesítésével hamarosan keresünk téged a részletekkel.
        </p>
      </div>
    </div>
  );
};