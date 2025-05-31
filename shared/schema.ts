
import { z } from "zod";

// Base schemas for validation
export const insertQuizSessionSchema = z.object({
  userId: z.string(),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
});

export const insertUserProgressSchema = z.object({
  userId: z.string(),
  letter: z.string().length(1),
  correctCount: z.number().int().min(0).default(0),
  incorrectCount: z.number().int().min(0).default(0),
  difficulty: z.number().int().min(1).max(5).default(1),
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
});

// TypeScript types
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = {
  id: number;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
};

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = {
  id: number;
  userId: string;
  letter: string;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
  nextReview: Date;
  difficulty: number;
};

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};
