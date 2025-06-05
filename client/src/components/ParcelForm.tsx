import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MapPin, PlaneTakeoff } from "lucide-react";

const parcelFormSchema = z.object({
  pickupAddress: z.string().min(5, "Pickup address must be at least 5 characters"),
  deliveryAddress: z.string().min(5, "Delivery address must be at least 5 characters"),
  recipientName: z.string().min(2, "Recipient name must be at least 2 characters"),
  recipientPhone: z.string().min(10, "Please enter a valid phone number"),
  senderPhone: z.string().min(10, "Please enter a valid phone number"),
  parcelSize: z.enum(["small", "medium", "large"]),
  priority: z.enum(["standard", "express", "next_transport"]),
  description: z.string().optional(),
});

type ParcelFormData = z.infer<typeof parcelFormSchema>;

export default function ParcelForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const form = useForm<ParcelFormData>({
    resolver: zodResolver(parcelFormSchema),
    defaultValues: {
      pickupAddress: "",
      deliveryAddress: "",
      recipientName: "",
      recipientPhone: "",
      senderPhone: "",
      parcelSize: "small",
      priority: "standard",
      description: "",
    },
  });

  const watchedValues = form.watch(['parcelSize', 'priority']);

  // Estimate cost when size or priority changes
  useQuery({
    queryKey: ['/api/estimate-cost', watchedValues[0], watchedValues[1]],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/estimate-cost', {
        parcelSize: watchedValues[0],
        priority: watchedValues[1],
      });
      const data = await response.json();
      setEstimatedCost(data.estimatedCost);
      return data;
    },
    enabled: !!(watchedValues[0] && watchedValues[1]),
  });

  const createParcelMutation = useMutation({
    mutationFn: async (data: ParcelFormData) => {
      const response = await apiRequest("POST", "/api/parcels", {
        ...data,
        estimatedCost: estimatedCost || 25,
      });
      return response.json();
    },
    onSuccess: (parcel) => {
      toast({
        title: "Parcel Booked Successfully!",
        description: "Your parcel has been scheduled for pickup.",
        action: (
          <Button
            size="sm"
            onClick={() => window.open(`/checkout/${parcel.id}`, '_blank')}
          >
            Pay Now
          </Button>
        ),
      });
      form.reset();
      setEstimatedCost(null);
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
        description: error.message || "Failed to create parcel",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ParcelFormData) => {
    createParcelMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send New Parcel</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter pickup address" {...field} />
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter delivery address" {...field} />
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+27 xxx xxx xxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sender Phone */}
            <FormField
              control={form.control}
              name="senderPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+27 xxx xxx xxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parcel Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="parcelSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcel Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt; 5kg)</SelectItem>
                        <SelectItem value="medium">Medium (5-15kg)</SelectItem>
                        <SelectItem value="large">Large (15-30kg)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="next_transport">Next Transport</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  R {estimatedCost ? estimatedCost.toFixed(2) : '25.00'}
                </div>
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of contents" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={createParcelMutation.isPending}
                className="px-8 py-3"
              >
                {createParcelMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlaneTakeoff className="h-4 w-4 mr-2" />
                    Send Parcel
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
