import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Clock, CheckCircle, Truck } from "lucide-react";

export default function LiveTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trackingData, isLoading } = useQuery({
    queryKey: [`/api/track/${trackingNumber}`],
    enabled: !!trackingNumber,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setTrackingNumber(searchQuery.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "in_transit":
        return <Truck className="h-3 w-3 text-yellow-600" />;
      case "collected":
        return <Package className="h-3 w-3 text-blue-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "in_transit":
        return "text-yellow-600";
      case "collected":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Live Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="space-y-2">
          <Input
            placeholder="Enter tracking number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit" 
            size="sm" 
            className="w-full"
            disabled={!searchQuery.trim() || isLoading}
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Track
          </Button>
        </form>

        {trackingData && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <p className="font-medium text-gray-900">{trackingData.parcel.trackingNumber}</p>
              <Badge 
                variant="outline" 
                className={getStatusColor(trackingData.parcel.status)}
              >
                {formatStatus(trackingData.parcel.status)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {trackingData.statusHistory.slice(0, 4).map((status: any, index: number) => (
                <div key={status.id} className="flex items-center text-sm">
                  <div className={`mr-3 ${index === 0 ? 'text-primary' : 'text-gray-400'}`}>
                    {getStatusIcon(status.status)}
                  </div>
                  <span className={`flex-1 ${index === 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {formatStatus(status.status)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {index === 0 ? 'Current' : new Date(status.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>

            {trackingData.parcel.estimatedDeliveryAt && trackingData.parcel.status !== 'delivered' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-3 w-3 mr-2" />
                  <span>ETA: {new Date(trackingData.parcel.estimatedDeliveryAt).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {trackingNumber && !trackingData && !isLoading && (
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <Package className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">Parcel not found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
