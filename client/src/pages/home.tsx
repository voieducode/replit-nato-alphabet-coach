import { Bell } from 'lucide-react';
import { useState } from 'react';
import ConverterSection from '@/components/converter-section';
import NotificationModal from '@/components/notification-modal';
import QuizSection from '@/components/quiz-section';
import SettingsSection from '@/components/settings-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WordQuizSection from '@/components/word-quiz-section';
import { QuizProvider } from '@/contexts/quiz-provider';
import { useLanguage } from '@/hooks/use-language';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'converter' | 'letterQuiz' | 'wordQuiz' | 'settings'
  >('converter');
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId] = useState('user-1'); // In a real app, this would come from auth
  const { translations } = useLanguage();

  // Use localStorage for notification management to avoid API dependencies
  const unreadCount = 0;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg relative">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-material relative cityscape-bg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white drop-shadow-xs">
            {translations.appName}
          </h1>
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
          <div className="grid grid-cols-4 gap-1 bg-primary/80 rounded-lg p-1">
            <button
              type="button"
              className={`py-2 px-2 rounded-md font-medium transition-colors text-xs ${
                activeTab === 'converter'
                  ? 'bg-white text-primary'
                  : 'text-primary-foreground hover:bg-primary/60'
              }`}
              onClick={() => setActiveTab('converter')}
            >
              {translations.converter}
            </button>
            <button
              type="button"
              className={`py-2 px-2 rounded-md font-medium transition-colors text-xs ${
                activeTab === 'letterQuiz'
                  ? 'bg-white text-primary'
                  : 'text-primary-foreground hover:bg-primary/60'
              }`}
              onClick={() => setActiveTab('letterQuiz')}
            >
              {translations.quiz}
            </button>
            <button
              type="button"
              className={`py-2 px-2 rounded-md font-medium transition-colors text-xs ${
                activeTab === 'wordQuiz'
                  ? 'bg-white text-primary'
                  : 'text-primary-foreground hover:bg-primary/60'
              }`}
              onClick={() => setActiveTab('wordQuiz')}
            >
              {translations.wordQuiz}
            </button>
            <button
              type="button"
              className={`py-2 px-2 rounded-md font-medium transition-colors text-xs ${
                activeTab === 'settings'
                  ? 'bg-white text-primary'
                  : 'text-primary-foreground hover:bg-primary/60'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              {translations.settings}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'converter' ? (
          <ConverterSection />
        ) : activeTab === 'letterQuiz' ? (
          <QuizProvider userId={userId}>
            <QuizSection />
          </QuizProvider>
        ) : activeTab === 'wordQuiz' ? (
          <WordQuizSection />
        ) : (
          <SettingsSection />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 p-2 sticky bottom-0">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            className={`flex flex-col items-center space-y-1 py-2 ${
              activeTab === 'converter' ? 'text-primary' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('converter')}
          >
            <div className="text-lg">⇄</div>
            <span className="text-xs font-medium">
              {translations.converter}
            </span>
          </button>
          <button
            type="button"
            className={`flex flex-col items-center space-y-1 py-2 ${
              activeTab === 'letterQuiz' ? 'text-primary' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('letterQuiz')}
          >
            <div className="text-lg">🎓</div>
            <span className="text-xs font-medium">{translations.quiz}</span>
          </button>
          <button
            type="button"
            className={`flex flex-col items-center space-y-1 py-2 ${
              activeTab === 'wordQuiz' ? 'text-primary' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('wordQuiz')}
          >
            <div className="text-lg">📝</div>
            <span className="text-xs font-medium">{translations.wordQuiz}</span>
          </button>
          <button
            type="button"
            className={`flex flex-col items-center space-y-1 py-2 ${
              activeTab === 'settings' ? 'text-primary' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('settings')}
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
