import {
  users,
  parcels,
  transports,
  notifications,
  parcelStatusHistory,
  type User,
  type UpsertUser,
  type Parcel,
  type InsertParcel,
  type Transport,
  type InsertTransport,
  type Notification,
  type InsertNotification,
  type ParcelStatusHistory,
  type InsertParcelStatusHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, like, count } from "drizzle-orm";
import { sendSMSNotification, createParcelNotificationMessage } from "./notifications";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Parcel operations
  createParcel(parcel: InsertParcel): Promise<Parcel>;
  getParcel(id: number): Promise<Parcel | undefined>;
  getParcelByTrackingNumber(trackingNumber: string): Promise<Parcel | undefined>;
  getUserParcels(userId: string): Promise<Parcel[]>;
  updateParcelStatus(id: number, status: string, notes?: string): Promise<void>;
  
  // Transport operations
  createTransport(transport: InsertTransport): Promise<Transport>;
  getTransports(): Promise<Transport[]>;
  getAvailableTransports(from: string, to: string): Promise<Transport[]>;
  updateTransportCapacity(id: number, availableCapacity: number): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Status history operations
  addParcelStatusHistory(history: InsertParcelStatusHistory): Promise<ParcelStatusHistory>;
  getParcelStatusHistory(parcelId: number): Promise<ParcelStatusHistory[]>;
  
  // Dashboard stats
  getUserParcelStats(userId: string): Promise<{
    total: number;
    inTransit: number;
    delivered: number;
    pending: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Parcel operations
  async createParcel(parcelData: InsertParcel): Promise<Parcel> {
    // Generate tracking number
    const trackingNumber = `RT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [parcel] = await db
      .insert(parcels)
      .values({
        ...parcelData,
        trackingNumber,
      })
      .returning();

    // Add initial status history
    await this.addParcelStatusHistory({
      parcelId: parcel.id,
      status: 'pending',
      notes: 'Parcel booking created',
    });

    return parcel;
  }

  async getParcel(id: number): Promise<Parcel | undefined> {
    const [parcel] = await db.select().from(parcels).where(eq(parcels.id, id));
    return parcel;
  }

  async getParcelByTrackingNumber(trackingNumber: string): Promise<Parcel | undefined> {
    const [parcel] = await db.select().from(parcels).where(eq(parcels.trackingNumber, trackingNumber));
    return parcel;
  }

  async getUserParcels(userId: string): Promise<Parcel[]> {
    return await db
      .select()
      .from(parcels)
      .where(eq(parcels.senderId, userId))
      .orderBy(desc(parcels.createdAt));
  }

  async updateParcelStatus(id: number, status: string, notes?: string): Promise<void> {
    // Get parcel details for SMS notification
    const parcel = await this.getParcel(id);
    
    await db
      .update(parcels)
      .set({ 
        status,
        updatedAt: new Date(),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
        ...(status === 'collected' && { pickedUpAt: new Date() }),
      })
      .where(eq(parcels.id, id));

    // Add status history
    await this.addParcelStatusHistory({
      parcelId: id,
      status,
      notes,
    });

    // Send SMS notification to recipient
    if (parcel) {
      const message = createParcelNotificationMessage(
        parcel.trackingNumber,
        status,
        parcel.recipientName,
        notes
      );
      
      // Send SMS notification (non-blocking)
      sendSMSNotification(parcel.recipientPhone, message).catch(error => {
        console.error('Failed to send SMS notification:', error);
      });
    }
  }

  // Transport operations
  async createTransport(transportData: InsertTransport): Promise<Transport> {
    const [transport] = await db.insert(transports).values(transportData).returning();
    return transport;
  }

  async getTransports(): Promise<Transport[]> {
    return await db
      .select()
      .from(transports)
      .orderBy(asc(transports.departureTime));
  }

  async getAvailableTransports(from: string, to: string): Promise<Transport[]> {
    return await db
      .select()
      .from(transports)
      .where(
        and(
          like(transports.routeFrom, `%${from}%`),
          like(transports.routeTo, `%${to}%`),
          eq(transports.status, 'scheduled')
        )
      )
      .orderBy(asc(transports.departureTime));
  }

  async updateTransportCapacity(id: number, availableCapacity: number): Promise<void> {
    await db
      .update(transports)
      .set({ availableCapacity, updatedAt: new Date() })
      .where(eq(transports.id, id));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Status history operations
  async addParcelStatusHistory(historyData: InsertParcelStatusHistory): Promise<ParcelStatusHistory> {
    const [history] = await db.insert(parcelStatusHistory).values(historyData).returning();
    return history;
  }

  async getParcelStatusHistory(parcelId: number): Promise<ParcelStatusHistory[]> {
    return await db
      .select()
      .from(parcelStatusHistory)
      .where(eq(parcelStatusHistory.parcelId, parcelId))
      .orderBy(desc(parcelStatusHistory.timestamp));
  }

  // Dashboard stats
  async getUserParcelStats(userId: string): Promise<{
    total: number;
    inTransit: number;
    delivered: number;
    pending: number;
  }> {
    const [totalResult] = await db
      .select({ count: count() })
      .from(parcels)
      .where(eq(parcels.senderId, userId));

    const [inTransitResult] = await db
      .select({ count: count() })
      .from(parcels)
      .where(and(
        eq(parcels.senderId, userId),
        eq(parcels.status, 'in_transit')
      ));

    const [deliveredResult] = await db
      .select({ count: count() })
      .from(parcels)
      .where(and(
        eq(parcels.senderId, userId),
        eq(parcels.status, 'delivered')
      ));

    const [pendingResult] = await db
      .select({ count: count() })
      .from(parcels)
      .where(and(
        eq(parcels.senderId, userId),
        eq(parcels.status, 'pending')
      ));

    return {
      total: totalResult.count,
      inTransit: inTransitResult.count,
      delivered: deliveredResult.count,
      pending: pendingResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
