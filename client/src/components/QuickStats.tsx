import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Parcels",
      value: stats?.total || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "In Transit",
      value: stats?.inTransit || 0,
      icon: Truck,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Delivered",
      value: stats?.delivered || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 ${item.bgColor} rounded-lg`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
