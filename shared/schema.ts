import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parcels = pgTable("parcels", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number").notNull().unique(),
  senderId: varchar("sender_id").notNull(),
  senderName: varchar("sender_name").notNull(),
  senderPhone: varchar("sender_phone").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  recipientName: varchar("recipient_name").notNull(),
  recipientPhone: varchar("recipient_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  parcelSize: varchar("parcel_size").notNull(), // small, medium, large
  priority: varchar("priority").notNull(), // standard, express, next_transport
  description: text("description"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, collected, in_transit, out_for_delivery, delivered, cancelled
  transportId: integer("transport_id"),
  scheduledPickupAt: timestamp("scheduled_pickup_at"),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
  estimatedDeliveryAt: timestamp("estimated_delivery_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transports = pgTable("transports", {
  id: serial("id").primaryKey(),
  operator: varchar("operator").notNull(), // Golden Arrow, Intercape, etc.
  vehicleNumber: varchar("vehicle_number").notNull(),
  routeFrom: varchar("route_from").notNull(),
  routeTo: varchar("route_to").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  capacity: integer("capacity").notNull().default(50),
  availableCapacity: integer("available_capacity").notNull().default(50),
  status: varchar("status").notNull().default("scheduled"), // scheduled, in_transit, arrived, cancelled
  currentLocation: text("current_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // info, success, warning, error
  parcelId: integer("parcel_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parcelStatusHistory = pgTable("parcel_status_history", {
  id: serial("id").primaryKey(),
  parcelId: integer("parcel_id").notNull(),
  status: varchar("status").notNull(),
  location: text("location"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const parcelsRelations = relations(parcels, ({ one, many }) => ({
  sender: one(users, {
    fields: [parcels.senderId],
    references: [users.id],
  }),
  transport: one(transports, {
    fields: [parcels.transportId],
    references: [transports.id],
  }),
  statusHistory: many(parcelStatusHistory),
}));

export const transportsRelations = relations(transports, ({ many }) => ({
  parcels: many(parcels),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  parcel: one(parcels, {
    fields: [notifications.parcelId],
    references: [parcels.id],
  }),
}));

export const parcelStatusHistoryRelations = relations(parcelStatusHistory, ({ one }) => ({
  parcel: one(parcels, {
    fields: [parcelStatusHistory.parcelId],
    references: [parcels.id],
  }),
}));

// Insert schemas
export const insertParcelSchema = createInsertSchema(parcels).omit({
  id: true,
  trackingNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransportSchema = createInsertSchema(transports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertParcelStatusHistorySchema = createInsertSchema(parcelStatusHistory).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertParcel = z.infer<typeof insertParcelSchema>;
export type Parcel = typeof parcels.$inferSelect;
export type InsertTransport = z.infer<typeof insertTransportSchema>;
export type Transport = typeof transports.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertParcelStatusHistory = z.infer<typeof insertParcelStatusHistorySchema>;
export type ParcelStatusHistory = typeof parcelStatusHistory.$inferSelect;
