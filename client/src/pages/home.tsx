import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import ConverterSection from "@/components/converter-section";
import QuizSection from "@/components/quiz-section";
import SettingsSection from "@/components/settings-section";
import NotificationModal from "@/components/notification-modal";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"converter" | "quiz" | "settings">("converter");
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId] = useState("user-1"); // In a real app, this would come from auth
  const { translations } = useLanguage();

  // Use localStorage for notification management to avoid API dependencies
  const unreadCount = 0;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg relative">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-material relative cityscape-bg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{translations.appName}</h1>
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
              {translations.converter}
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "quiz"
                  ? "bg-white text-primary"
                  : "text-primary-foreground hover:bg-primary/60"
              }`}
              onClick={() => setActiveTab("quiz")}
            >
              {translations.quiz}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "converter" ? (
          <ConverterSection />
        ) : activeTab === "quiz" ? (
          <QuizSection userId={userId} />
        ) : (
          <SettingsSection />
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
            <span className="text-xs font-medium">{translations.converter}</span>
          </button>
          <button
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "quiz" ? "text-primary" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("quiz")}
          >
            <div className="text-lg">🎓</div>
            <span className="text-xs font-medium">{translations.quiz}</span>
          </button>
          <button
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "settings" ? "text-primary" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <div className="text-lg">⚙️</div>
            <span className="text-xs font-medium">{translations.settings}</span>
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
