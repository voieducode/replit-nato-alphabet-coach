interface QuizSession {
  id: number;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

interface UserProgress {
  id: number;
  userId: string;
  letter: string;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
  nextReview: Date;
  difficulty: number;
}

interface Notification {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

class InMemoryStorage {
  private quizSessions: QuizSession[] = [];
  private userProgress: UserProgress[] = [];
  private notifications: Notification[] = [];
  private nextId = 1;

  // Quiz Sessions
  async createQuizSession(data: {
    userId: string;
    score: number;
    totalQuestions: number;
  }): Promise<QuizSession> {
    const session: QuizSession = {
      id: this.nextId++,
      userId: data.userId,
      score: data.score,
      totalQuestions: data.totalQuestions,
      completedAt: new Date(),
    };
    this.quizSessions.push(session);
    return session;
  }

  async getUserQuizSessions(userId: string): Promise<QuizSession[]> {
    return this.quizSessions.filter((session) => session.userId === userId);
  }

  // User Progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.userProgress.filter((progress) => progress.userId === userId);
  }

  async updateUserProgress(
    userId: string,
    letter: string,
    isCorrect: boolean
  ): Promise<UserProgress> {
    let progress = this.userProgress.find(
      (p) => p.userId === userId && p.letter === letter
    );

    if (!progress) {
      progress = {
        id: this.nextId++,
        userId,
        letter,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: new Date(),
        nextReview: new Date(),
        difficulty: 1,
      };
      this.userProgress.push(progress);
    }

    if (isCorrect) {
      progress.correctCount++;
      progress.difficulty = Math.max(1, progress.difficulty - 1);
    } else {
      progress.incorrectCount++;
      progress.difficulty = Math.min(5, progress.difficulty + 1);
    }

    progress.lastReviewed = new Date();
    progress.nextReview = new Date(
      Date.now() + progress.difficulty * 24 * 60 * 60 * 1000
    );

    return progress;
  }

  async getLetterProgress(
    userId: string,
    letter: string
  ): Promise<UserProgress | null> {
    return (
      this.userProgress.find(
        (p) => p.userId === userId && p.letter === letter
      ) || null
    );
  }

  // Notifications
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead?: boolean;
  }): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: data.isRead || false,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifications
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notifications.filter((n) => n.userId === userId && !n.isRead)
      .length;
  }
}

export const storage = new InMemoryStorage();
