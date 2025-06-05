import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import type { Parcel } from "@shared/schema";

// Load Stripe outside of component render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ parcel, amount }: { parcel: Parcel; amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/track/${parcel.trackingNumber}?payment=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your parcel payment has been processed successfully!",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay R{amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, params] = useRoute("/checkout/:parcelId");
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const { data: parcel, isLoading: parcelLoading } = useQuery<Parcel>({
    queryKey: [`/api/parcels/${params?.parcelId}`],
    enabled: !!params?.parcelId,
  });

  useEffect(() => {
    if (parcel && parcel.estimatedCost) {
      // Create PaymentIntent when parcel data is loaded
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: parseFloat(parcel.estimatedCost),
        parcelId: parcel.id
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Payment Setup Failed",
            description: "Could not initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [parcel, toast]);

  if (parcelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Parcel Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                The parcel you're trying to pay for could not be found.
              </p>
              <Button asChild>
                <a href="/">Return to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
              <span>Setting up payment...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" asChild>
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600">Secure payment for your parcel delivery</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Parcel Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parcel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tracking Number:</span>
                <Badge variant="outline">{parcel.trackingNumber}</Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">From:</p>
                  <p className="font-medium">{parcel.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">To:</p>
                  <p className="font-medium">{parcel.deliveryAddress}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recipient:</p>
                  <p className="font-medium">{parcel.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Size & Priority:</p>
                  <p className="font-medium">
                    {formatStatus(parcel.parcelSize)} • {formatStatus(parcel.priority)}
                  </p>
                </div>
              </div>
              
              {parcel.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description:</p>
                    <p className="font-medium">{parcel.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>R{parseFloat(parcel.estimatedCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>R0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>R{parseFloat(parcel.estimatedCost).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  parcel={parcel} 
                  amount={parseFloat(parcel.estimatedCost)} 
                />
              </Elements>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
            Your payment is secured by Stripe's industry-leading encryption
          </div>
        </div>
      </div>
    </div>
  );
}