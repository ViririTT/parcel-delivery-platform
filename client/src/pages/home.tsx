import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import QuickStats from "@/components/QuickStats";
import ParcelForm from "@/components/ParcelForm";
import ParcelList from "@/components/ParcelList";
import TransportSchedule from "@/components/TransportSchedule";
import LiveTracking from "@/components/LiveTracking";
import NotificationCenter from "@/components/NotificationCenter";
import RouteMap from "@/components/RouteMap";
import AdminPanel from "@/components/AdminPanel";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <QuickStats />

            {/* Send New Parcel Form */}
            <ParcelForm />

            {/* Recent Parcels */}
            <ParcelList />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Transport */}
            <TransportSchedule />

            {/* Live Tracking */}
            <LiveTracking />

            {/* Notifications */}
            <NotificationCenter />
          </div>
        </div>

        {/* Route Map */}
        <RouteMap />

        {/* Admin Panel */}
        <div className="mt-8">
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}
