import type { Notification } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell, TrendingUp, Trophy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function NotificationModal({
  isOpen,
  onClose,
  userId,
}: NotificationModalProps) {
  const { translations } = useLanguage();
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${userId}`],
    enabled: isOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/notifications/${userId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/notifications/${userId}/unread-count`],
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'daily_reminder':
        return <Bell className="text-orange-500 h-5 w-5" />;
      case 'achievement':
        return <Trophy className="text-info-foreground h-5 w-5" />;
      case 'progress':
        return <TrendingUp className="text-blue-500 h-5 w-5" />;
      default:
        return <Bell className="text-gray-500 h-5 w-5" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'daily_reminder':
        return 'bg-orange-50 border-orange-100';
      case 'achievement':
        return 'bg-info border-yellow-100';
      case 'progress':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours === 1) {
      return '1 hour ago';
    }
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return '1 day ago';
    }
    return `${diffInDays} days ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-lg p-4 transform transition-transform max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">
            {translations.notificationsPanelTitle}
          </h3>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  notifications
                    .filter((n) => !n.isRead)
                    .forEach((n) => markReadMutation.mutate(n.id));
                }}
              >
                {translations.markAllAsRead}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{translations.noNotifications}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  getNotificationBgColor(notification.type),
                  !notification.isRead && 'border-l-4 border-l-primary'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <Badge className="bg-primary text-primary-foreground ml-2 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
