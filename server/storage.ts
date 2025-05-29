import { 
  quizSessions, 
  userProgress, 
  notifications,
  type QuizSession, 
  type UserProgress, 
  type Notification,
  type InsertQuizSession, 
  type InsertUserProgress, 
  type InsertNotification 
} from "@shared/schema";

export interface IStorage {
  // Quiz Sessions
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  getUserQuizSessions(userId: string): Promise<QuizSession[]>;
  
  // User Progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(userId: string, letter: string, isCorrect: boolean): Promise<UserProgress>;
  getLetterProgress(userId: string, letter: string): Promise<UserProgress | undefined>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private quizSessions: Map<number, QuizSession> = new Map();
  private userProgress: Map<string, UserProgress> = new Map(); // key: userId-letter
  private notifications: Map<number, Notification> = new Map();
  private currentIds = {
    quizSession: 1,
    userProgress: 1,
    notification: 1,
  };

  async createQuizSession(insertSession: InsertQuizSession): Promise<QuizSession> {
    const id = this.currentIds.quizSession++;
    const session: QuizSession = {
      ...insertSession,
      id,
      completedAt: new Date(),
    };
    this.quizSessions.set(id, session);
    return session;
  }

  async getUserQuizSessions(userId: string): Promise<QuizSession[]> {
    return Array.from(this.quizSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async updateUserProgress(userId: string, letter: string, isCorrect: boolean): Promise<UserProgress> {
    const key = `${userId}-${letter}`;
    let progress = this.userProgress.get(key);
    
    if (!progress) {
      const id = this.currentIds.userProgress++;
      progress = {
        id,
        userId,
        letter,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: new Date(),
        nextReview: new Date(),
        difficulty: 1,
      };
    }

    if (isCorrect) {
      progress.correctCount++;
      // Decrease difficulty (easier) and increase review interval
      progress.difficulty = Math.max(1, progress.difficulty - 0.1);
    } else {
      progress.incorrectCount++;
      // Increase difficulty (harder) and decrease review interval
      progress.difficulty = Math.min(5, progress.difficulty + 0.3);
    }

    progress.lastReviewed = new Date();
    
    // Calculate next review based on spaced repetition
    const intervalDays = Math.pow(2, Math.max(0, 3 - progress.difficulty));
    progress.nextReview = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
    
    this.userProgress.set(key, progress);
    return progress;
  }

  async getLetterProgress(userId: string, letter: string): Promise<UserProgress | undefined> {
    const key = `${userId}-${letter}`;
    return this.userProgress.get(key);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentIds.notification++;
    const notification: Notification = {
      id,
      userId: insertNotification.userId,
      type: insertNotification.type,
      title: insertNotification.title,
      message: insertNotification.message,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }
}

export const storage = new MemStorage();
