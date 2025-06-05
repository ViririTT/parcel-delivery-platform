import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";

export default function ParcelList() {
  const { data: parcels, isLoading } = useQuery({
    queryKey: ["/api/parcels"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_transit":
        return <Truck className="h-5 w-5 text-yellow-600" />;
      case "collected":
        return <Package className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "collected":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatRoute = (pickup: string, delivery: string) => {
    // Extract city names from addresses
    const pickupCity = pickup.split(',')[pickup.split(',').length - 2]?.trim() || pickup.split(',')[0];
    const deliveryCity = delivery.split(',')[delivery.split(',').length - 2]?.trim() || delivery.split(',')[0];
    return `${pickupCity} → ${deliveryCity}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Parcels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Parcels</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!parcels || parcels.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parcels yet</h3>
            <p className="text-gray-600">
              Send your first parcel using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {parcels.slice(0, 5).map((parcel: any) => (
              <div 
                key={parcel.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => window.open(`/track/${parcel.trackingNumber}`, '_blank')}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getStatusIcon(parcel.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{parcel.trackingNumber}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {formatRoute(parcel.pickupAddress, parcel.deliveryAddress)}
                    </p>
                    <p className="text-xs text-gray-500">{parcel.recipientName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(parcel.status)}>
                    {formatStatus(parcel.status)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {parcel.deliveredAt ? 
                      `Delivered ${new Date(parcel.deliveredAt).toLocaleDateString()}` :
                      parcel.estimatedDeliveryAt ?
                      `ETA: ${new Date(parcel.estimatedDeliveryAt).toLocaleDateString()}` :
                      `Created ${new Date(parcel.createdAt).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
