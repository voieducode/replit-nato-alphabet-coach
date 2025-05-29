import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConverterSection from "@/components/converter-section";
import QuizSection from "@/components/quiz-section";
import NotificationModal from "@/components/notification-modal";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"converter" | "quiz">("converter");
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId] = useState("user-1"); // In a real app, this would come from auth

  const { data: unreadCount = 0 } = useQuery({
    queryKey: [`/api/notifications/${userId}/unread-count`],
    select: (data: { count: number }) => data.count,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create initial daily reminder notification
  useEffect(() => {
    const createDailyReminder = async () => {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            type: "daily_reminder",
            title: "Daily Practice Reminder",
            message: "Time for your NATO alphabet practice!",
            isRead: false,
          }),
        });
      } catch (error) {
        console.error("Failed to create daily reminder:", error);
      }
    };

    // Check if we should create a daily reminder (simplified logic)
    const lastReminder = localStorage.getItem("lastDailyReminder");
    const today = new Date().toDateString();
    
    if (lastReminder !== today) {
      createDailyReminder();
      localStorage.setItem("lastDailyReminder", today);
    }
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg relative">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-material relative cityscape-bg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">NATO Alphabet Coach</h1>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 rounded-full hover:bg-primary/80 text-primary-foreground"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 min-w-[20px]">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <nav className="mt-4">
          <div className="flex space-x-1 bg-primary/80 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "converter"
                  ? "bg-white text-primary"
                  : "text-primary-foreground hover:bg-primary/60"
              }`}
              onClick={() => setActiveTab("converter")}
            >
              Converter
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "quiz"
                  ? "bg-white text-primary"
                  : "text-primary-foreground hover:bg-primary/60"
              }`}
              onClick={() => setActiveTab("quiz")}
            >
              Quiz
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "converter" ? (
          <ConverterSection />
        ) : (
          <QuizSection userId={userId} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="flex justify-around">
          <button
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "converter" ? "text-primary" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("converter")}
          >
            <div className="text-lg">⇄</div>
            <span className="text-xs font-medium">Convert</span>
          </button>
          <button
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "quiz" ? "text-primary" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("quiz")}
          >
            <div className="text-lg">🎓</div>
            <span className="text-xs font-medium">Quiz</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400">
            <div className="text-lg">⚙️</div>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={userId}
      />
    </div>
  );
}
