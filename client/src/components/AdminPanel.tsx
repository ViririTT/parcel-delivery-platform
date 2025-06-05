import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Settings, Package, Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["/api/parcels"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ parcelId, status, notes }: { parcelId: number; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/parcels/${parcelId}/status`, {
        status,
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Parcel status updated successfully. SMS notification sent to recipient.",
      });
      setSelectedParcel(null);
      setNewStatus("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/parcels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to update parcel status",
        variant: "destructive",
      });
    },
  });

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
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
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
        return "bg-orange-100 text-orange-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleUpdateStatus = () => {
    if (!selectedParcel || !newStatus) return;

    updateStatusMutation.mutate({
      parcelId: selectedParcel.id,
      status: newStatus,
      notes: notes.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Admin Panel - Update Parcel Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parcel Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Parcel to Update
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {parcels.map((parcel: any) => (
              <div
                key={parcel.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedParcel?.id === parcel.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedParcel(parcel)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{parcel.trackingNumber}</p>
                    <p className="text-sm text-gray-600">{parcel.recipientName}</p>
                    <p className="text-xs text-gray-500">{parcel.recipientPhone}</p>
                  </div>
                  <Badge className={getStatusColor(parcel.status)}>
                    {getStatusIcon(parcel.status)}
                    <span className="ml-1">{formatStatus(parcel.status)}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedParcel && (
          <div className="border-t pt-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Parcel</h4>
              <p className="text-blue-800">
                <strong>{selectedParcel.trackingNumber}</strong> - {selectedParcel.recipientName}
              </p>
              <p className="text-sm text-blue-700">
                Current Status: {formatStatus(selectedParcel.status)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add notes about the status update..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="flex-1"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Update Status & Send SMS
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedParcel(null);
                  setNewStatus("");
                  setNotes("");
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Note:</strong> Updating the status will automatically send an SMS notification 
              to the recipient ({selectedParcel.recipientPhone}) with the status update.
            </div>
          </div>
        )}

        {parcels.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Parcels Found</h3>
            <p className="text-gray-600">
              Create some parcels first to test status updates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}