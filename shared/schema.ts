import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  // Personal Information
  fullName: text("full_name").notNull(),
  cpf: text("cpf").notNull(),
  rg: text("rg"),
  birthDate: text("birth_date").notNull(),
  gender: text("gender"),
  
  // Contact Information
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  
  // Address
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  
  // Course Information
  course: text("course").notNull(),
  shift: text("shift").notNull(),
  modality: text("modality").notNull(),
  additionalInfo: text("additional_info"),
  
  // Registration Metadata
  status: text("status").default("pending").notNull(),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  registrationDate: true,
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  type: text("type").notNull(),
  fileName: text("file_name").notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded file
  mimeType: text("mime_type").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
});

export const formFields = pgTable("form_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(),
  required: boolean("required").default(false),
  order: integer("order").notNull(),
  section: text("section").notNull(),
  active: boolean("active").default(true),
});

export const insertFormFieldSchema = createInsertSchema(formFields).omit({
  id: true,
});

export const documentRequirements = pgTable("document_requirements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  required: boolean("required").default(false),
  active: boolean("active").default(true),
  order: integer("order").notNull(),
});

export const insertDocumentRequirementSchema = createInsertSchema(documentRequirements).omit({
  id: true,
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id"),
  sender: text("sender").notNull(), // "student" or "system"
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type FormField = typeof formFields.$inferSelect;
export type InsertFormField = z.infer<typeof insertFormFieldSchema>;

export type DocumentRequirement = typeof documentRequirements.$inferSelect;
export type InsertDocumentRequirement = z.infer<typeof insertDocumentRequirementSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
