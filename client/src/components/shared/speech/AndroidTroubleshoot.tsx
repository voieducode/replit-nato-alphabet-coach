import { AlertTriangle, Shield, Smartphone, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AndroidTroubleshootProps {
  isAndroid: boolean;
  isSecureContext: boolean;
  hasUserGesture: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

export function AndroidTroubleshoot({
  isAndroid,
  isSecureContext,
  hasUserGesture,
  onRetry,
  onDismiss,
}: AndroidTroubleshootProps) {
  if (!isAndroid) {
    return null;
  }

  const issues = [
    {
      condition: !isSecureContext,
      icon: Shield,
      title: 'HTTPS Required',
      description:
        'Android requires a secure connection (HTTPS) for microphone access.',
      solution: 'Please access this site using HTTPS (https://...)',
      critical: true,
    },
    {
      condition: !hasUserGesture,
      icon: Smartphone,
      title: 'User Interaction Required',
      description:
        'Android requires user interaction before accessing the microphone.',
      solution: 'Tap the microphone button to enable voice input.',
      critical: false,
    },
  ];

  const activeIssues = issues.filter((issue) => issue.condition);

  if (activeIssues.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Smartphone className="h-5 w-5" />
          Android Device Detected
        </CardTitle>
        <CardDescription className="text-orange-700">
          Some additional steps may be required for microphone access on Android
          devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeIssues.map((issue, index) => {
          const Icon = issue.icon;
          return (
            <Alert
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              variant={issue.critical ? 'destructive' : 'default'}
            >
              <Icon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">{issue.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {issue.description}
                </div>
                <div className="text-sm font-medium mt-2">
                  Solution: {issue.solution}
                </div>
              </AlertDescription>
            </Alert>
          );
        })}

        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-orange-800">
            General Android Troubleshooting:
          </h4>
          <div className="grid gap-2 text-sm text-orange-700">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Ensure microphone permissions are enabled in browser settings
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Wifi className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Check that you have a stable internet connection</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Close other apps that might be using the microphone</span>
            </div>
            <div className="flex items-start gap-2">
              <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Try refreshing the page and allowing microphone access when
                prompted
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
          <Button onClick={onDismiss} variant="ghost" size="sm">
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
