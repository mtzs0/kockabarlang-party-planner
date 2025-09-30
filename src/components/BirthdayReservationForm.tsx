import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "./reservation/StepIndicator";
import { DateSelectionStep } from "./reservation/DateSelectionStep";
import { TimeSelectionStep } from "./reservation/TimeSelectionStep";
import { ThemeSelectionStep } from "./reservation/ThemeSelectionStep";
import { ClientDataStep } from "./reservation/ClientDataStep";
import { SummaryStep } from "./reservation/SummaryStep";
import { SuccessStep } from "./reservation/SuccessStep";

export interface ReservationData {
  date: string;
  time: string;
  theme: string;
  parentName: string;
  childName: string;
  childBirthday: string;
  phone: string;
  email: string;
  message: string;
  acceptedPolicy: boolean;
}

const STEPS = [
  { id: 1, title: "Dátum" },
  { id: 2, title: "Időpont" },
  { id: 3, title: "Téma" },
  { id: 4, title: "Adatok" },
  { id: 5, title: "Összefoglaló" },
];

export const BirthdayReservationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: "",
    time: "",
    theme: "",
    parentName: "",
    childName: "",
    childBirthday: "",
    phone: "",
    email: "",
    message: "",
    acceptedPolicy: false,
  });

  const handleStepComplete = (step: number, data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
    
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    
    if (step < 6) {
      setCurrentStep(step + 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DateSelectionStep
            selectedDate={reservationData.date}
            onDateSelect={(date) => handleStepComplete(1, { date })}
          />
        );
      case 2:
        return (
          <TimeSelectionStep
            selectedTime={reservationData.time}
            selectedDate={reservationData.date}
            onTimeSelect={(time) => handleStepComplete(2, { time })}
          />
        );
      case 3:
        return (
          <ThemeSelectionStep
            selectedTheme={reservationData.theme}
            onThemeSelect={(theme) => handleStepComplete(3, { theme })}
          />
        );
      case 4:
        return (
          <ClientDataStep
            data={{
              parentName: reservationData.parentName,
              childName: reservationData.childName,
              childBirthday: reservationData.childBirthday,
              phone: reservationData.phone,
              email: reservationData.email,
              message: reservationData.message,
              acceptedPolicy: reservationData.acceptedPolicy,
            }}
            onDataSubmit={(data) => handleStepComplete(4, data)}
          />
        );
      case 5:
        return (
          <SummaryStep
            data={reservationData}
            onConfirm={() => handleStepComplete(5, {})}
          />
        );
      case 6:
        return (
          <SuccessStep
            data={reservationData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-form-bg min-h-screen">
      <Card 
        className="h-[700px] flex flex-col shadow-[var(--shadow-form)] border-2 border-primary bg-background"
        style={{ height: '700px' }}
      >
        {/* Header with logo and title */}
        <div className="p-6 border-b bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
          <h1 className="text-2xl font-bold text-center">Kockabarlang</h1>
          <p className="text-center text-primary-foreground/90 mt-1">Születésnapi foglalás</p>
        </div>

        {/* Step Indicator */}
        <div className="p-4 border-b">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep > 5 ? 5 : currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-hidden">
          {renderCurrentStep()}
        </div>
      </Card>
    </div>
  );
};