import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Search, MapPin, Clock, Package, CheckCircle } from "lucide-react";

export default function Track() {
  const [, params] = useRoute("/track/:trackingNumber?");
  const [trackingNumber, setTrackingNumber] = useState(params?.trackingNumber || "");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/track/${trackingNumber}`],
    enabled: !!trackingNumber,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setTrackingNumber(searchQuery.trim());
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_transit":
        return <Truck className="h-4 w-4 text-yellow-600" />;
      case "collected":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">PATISA Transit</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/">Dashboard</a>
              </Button>
              <Button asChild>
                <a href="/api/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Your Parcel
            </CardTitle>
            <CardDescription>
              Enter your tracking number to see real-time status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="Enter tracking number (e.g., PT-2024-001234)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingNumber && (
          <>
            {isLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  <span className="ml-2">Loading tracking information...</span>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Parcel Not Found
                  </h3>
                  <p className="text-gray-600">
                    Please check your tracking number and try again.
                  </p>
                </CardContent>
              </Card>
            )}

            {data && (
              <div className="space-y-6">
                {/* Parcel Details */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">
                          {data.parcel.trackingNumber}
                        </CardTitle>
                        <CardDescription>
                          {data.parcel.pickupAddress} → {data.parcel.deliveryAddress}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(data.parcel.status)}>
                        {getStatusIcon(data.parcel.status)}
                        <span className="ml-1">{formatStatus(data.parcel.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Recipient Details</h4>
                        <p className="text-gray-600">{data.parcel.recipientName}</p>
                        <p className="text-gray-600">{data.parcel.recipientPhone}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Parcel Details</h4>
                        <p className="text-gray-600">Size: {formatStatus(data.parcel.parcelSize)}</p>
                        <p className="text-gray-600">Priority: {formatStatus(data.parcel.priority)}</p>
                        {data.parcel.description && (
                          <p className="text-gray-600">Description: {data.parcel.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking Timeline</CardTitle>
                    <CardDescription>
                      Real-time updates on your parcel's journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.statusHistory.map((status: any, index: number) => (
                        <div key={status.id} className="flex items-start space-x-4">
                          <div className="flex flex-col items-center">
                            <div className={`rounded-full p-2 ${
                              index === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {getStatusIcon(status.status)}
                            </div>
                            {index < data.statusHistory.length - 1 && (
                              <div className="w-px h-8 bg-gray-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-900">
                                {formatStatus(status.status)}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(status.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {status.location && (
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {status.location}
                              </p>
                            )}
                            {status.notes && (
                              <p className="text-sm text-gray-600 mt-1">{status.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Estimated Delivery */}
                {data.parcel.estimatedDeliveryAt && data.parcel.status !== 'delivered' && (
                  <Card>
                    <CardContent className="flex items-center justify-between py-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Estimated Delivery</h4>
                          <p className="text-gray-600">
                            {new Date(data.parcel.estimatedDeliveryAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        On Time
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you can't find your parcel or have questions about your delivery, 
              please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline">
                Contact Support
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Send New Parcel</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
