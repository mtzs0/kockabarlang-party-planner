import { CheckCircle, Calendar, Clock, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReservationData } from "../BirthdayReservationForm";

interface SuccessStepProps {
  data: ReservationData;
}

export const SuccessStep = ({ data }: SuccessStepProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Foglalás sikeres!
          </h2>
          <p className="text-muted-foreground">
            A születésnapi foglalásod sikeresen rögzítettük.
          </p>
        </div>

        {/* Reservation Summary */}
        <Card className="p-4 text-left">
          <h3 className="font-semibold mb-3 text-center">Foglalás részletei</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Dátum:</span>
              </div>
              <span className="text-sm font-medium">{formatDate(data.date)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Időpont:</span>
              </div>
              <span className="text-sm font-medium">{data.time}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Téma:</span>
              </div>
              <span className="text-sm font-medium">{data.theme}</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">Mi a következő lépés?</h3>
          <p className="text-sm text-muted-foreground">
            Hamarosan keresünk téged a megadott elérhetőségeken a részletek egyeztetése érdekében.
          </p>
        </div>

        {/* Contact Information */}
        <p className="text-xs text-muted-foreground">
          Ha kérdésed van, keress minket bizalommal!
        </p>
      </div>
    </div>
  );
};