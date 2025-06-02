import type { AboutCardProps } from '../types';
import { Card, CardContent } from '@/components/ui/card';

export function AboutCard({ translations }: AboutCardProps) {
  return (
    <Card className="bg-gray-50 border border-gray-200">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">
          {translations.about}
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          {translations.aboutDescription}
        </p>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{translations.version}</span>
          <span>•</span>
          <span>{translations.builtWith}</span>
        </div>
      </CardContent>
    </Card>
  );
}
