import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertQuizSessionSchema,
  insertNotificationSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quiz Sessions
  app.post("/api/quiz-sessions", async (req, res) => {
    try {
      const validatedData = insertQuizSessionSchema.parse(req.body);
      const session = await storage.createQuizSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid quiz session data" });
    }
  });

  app.get("/api/quiz-sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getUserQuizSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz sessions" });
    }
  });

  // User Progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });

  app.post("/api/progress/:userId/:letter", async (req, res) => {
    try {
      const { userId, letter } = req.params;
      const { isCorrect } = req.body;

      if (typeof isCorrect !== "boolean") {
        return res.status(400).json({ error: "isCorrect must be a boolean" });
      }

      const progress = await storage.updateUserProgress(
        userId,
        letter.toUpperCase(),
        isCorrect
      );
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.get("/api/progress/:userId/:letter", async (req, res) => {
    try {
      const { userId, letter } = req.params;
      const progress = await storage.getLetterProgress(
        userId,
        letter.toUpperCase()
      );
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch letter progress" });
    }
  });

  // Notifications
  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: "Invalid notification data" });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.get("/api/notifications/:userId/unread-count", async (req, res) => {
    try {
      const { userId } = req.params;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch unread notification count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
