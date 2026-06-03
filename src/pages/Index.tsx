import { BirthdayReservationForm } from "@/components/BirthdayReservationForm";
import { AdminGate } from "@/components/admin/AdminGate";

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <BirthdayReservationForm />
      <AdminGate />
    </div>
  );
};

export default Index;
