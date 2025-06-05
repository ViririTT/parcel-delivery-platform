import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, Clock, MapPin } from "lucide-react";

export default function TransportSchedule() {
  const { data: transports, isLoading } = useQuery({
    queryKey: ["/api/transports"],
  });

  const getAvailabilityStatus = (transport: any) => {
    const capacityRatio = transport.availableCapacity / transport.capacity;
    if (capacityRatio > 0.5) return { label: "Available", color: "bg-green-100 text-green-800" };
    if (capacityRatio > 0.1) return { label: "Limited", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Full", color: "bg-red-100 text-red-800" };
  };

  const isUpcoming = (departureTime: string) => {
    return new Date(departureTime) > new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Available Transport</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const upcomingTransports = transports?.filter((transport: any) => 
    isUpcoming(transport.departureTime) && transport.status === 'scheduled'
  ).slice(0, 3) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          Next Available Transport
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTransports.length === 0 ? (
          <div className="text-center py-8">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled transports</h3>
            <p className="text-gray-600 text-sm">
              Transport schedules will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTransports.map((transport: any) => {
              const availability = getAvailabilityStatus(transport);
              
              return (
                <div 
                  key={transport.id}
                  className={`p-4 border rounded-lg ${
                    availability.label === 'Available' ? 'bg-green-50 border-green-200' :
                    availability.label === 'Limited' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{transport.operator}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {transport.routeFrom} → {transport.routeTo}
                      </p>
                      <p className="text-xs text-gray-500">{transport.vehicleNumber}</p>
                    </div>
                    <Badge className={availability.color}>
                      {availability.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Departure:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(transport.departureTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Arrival:</span>
                      <span className="font-medium">
                        {new Date(transport.arrivalTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Capacity: {transport.availableCapacity}/{transport.capacity} available
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
