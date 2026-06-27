import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "./AdminDashboard";
import NurseDashboard from "./NurseDashboard";
import DoctorDashboard from "./DoctorDashboard";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const role = user?.role?.toUpperCase() || "PROVIDER";

  if (role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (role === "NURSE") {
    return <NurseDashboard />;
  }

  // Default for DOCTOR, PROVIDER, or others
  return <DoctorDashboard />;
}
