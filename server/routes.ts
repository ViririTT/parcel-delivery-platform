import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertParcelSchema, insertTransportSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Parcel routes
  app.post('/api/parcels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const parcelData = insertParcelSchema.parse({
        ...req.body,
        senderId: userId,
        senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        senderPhone: req.body.senderPhone || '', // Should be provided in form
      });

      const parcel = await storage.createParcel(parcelData);
      
      // Create notification
      await storage.createNotification({
        userId,
        title: `Parcel ${parcel.trackingNumber} created`,
        message: `Your parcel to ${parcel.deliveryAddress} has been successfully booked.`,
        type: 'success',
        parcelId: parcel.id,
      });

      res.json(parcel);
    } catch (error: any) {
      console.error("Error creating parcel:", error);
      res.status(400).json({ message: error.message || "Failed to create parcel" });
    }
  });

  app.get('/api/parcels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parcels = await storage.getUserParcels(userId);
      res.json(parcels);
    } catch (error) {
      console.error("Error fetching parcels:", error);
      res.status(500).json({ message: "Failed to fetch parcels" });
    }
  });

  app.get('/api/parcels/:id', isAuthenticated, async (req: any, res) => {
    try {
      const parcelId = parseInt(req.params.id);
      const parcel = await storage.getParcel(parcelId);
      
      if (!parcel) {
        return res.status(404).json({ message: "Parcel not found" });
      }

      // Check if user owns this parcel
      if (parcel.senderId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(parcel);
    } catch (error) {
      console.error("Error fetching parcel:", error);
      res.status(500).json({ message: "Failed to fetch parcel" });
    }
  });

  app.get('/api/track/:trackingNumber', async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const parcel = await storage.getParcelByTrackingNumber(trackingNumber);
      
      if (!parcel) {
        return res.status(404).json({ message: "Parcel not found" });
      }

      const statusHistory = await storage.getParcelStatusHistory(parcel.id);
      
      res.json({
        parcel,
        statusHistory,
      });
    } catch (error) {
      console.error("Error tracking parcel:", error);
      res.status(500).json({ message: "Failed to track parcel" });
    }
  });

  // Transport routes
  app.get('/api/transports', async (req, res) => {
    try {
      const { from, to } = req.query;
      
      let transports;
      if (from && to) {
        transports = await storage.getAvailableTransports(from as string, to as string);
      } else {
        transports = await storage.getTransports();
      }
      
      res.json(transports);
    } catch (error) {
      console.error("Error fetching transports:", error);
      res.status(500).json({ message: "Failed to fetch transports" });
    }
  });

  app.post('/api/transports', isAuthenticated, async (req, res) => {
    try {
      const transportData = insertTransportSchema.parse(req.body);
      const transport = await storage.createTransport(transportData);
      res.json(transport);
    } catch (error: any) {
      console.error("Error creating transport:", error);
      res.status(400).json({ message: error.message || "Failed to create transport" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserParcelStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Cost estimation
  app.post('/api/estimate-cost', async (req, res) => {
    try {
      const { parcelSize, priority, distance = 100 } = req.body;
      
      const sizeMultiplier = {
        'small': 1,
        'medium': 1.5,
        'large': 2.5,
      };
      
      const priorityMultiplier = {
        'standard': 1,
        'express': 1.5,
        'next_transport': 2,
      };
      
      const baseCost = 25;
      const distanceMultiplier = Math.max(1, distance / 100);
      
      const estimatedCost = baseCost * 
        (sizeMultiplier[parcelSize as keyof typeof sizeMultiplier] || 1) * 
        (priorityMultiplier[priority as keyof typeof priorityMultiplier] || 1) *
        distanceMultiplier;
      
      res.json({ estimatedCost: parseFloat(estimatedCost.toFixed(2)) });
    } catch (error) {
      console.error("Error estimating cost:", error);
      res.status(500).json({ message: "Failed to estimate cost" });
    }
  });

  // Stripe payment route for parcel payments
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount, parcelId } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "zar", // South African Rand
        metadata: {
          parcelId: parcelId?.toString() || '',
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Admin route to update parcel status (for testing)
  app.patch('/api/parcels/:id/status', isAuthenticated, async (req, res) => {
    try {
      const parcelId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      await storage.updateParcelStatus(parcelId, status, notes);
      
      res.json({ success: true, message: 'Parcel status updated successfully' });
    } catch (error) {
      console.error("Error updating parcel status:", error);
      res.status(500).json({ message: "Failed to update parcel status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
