import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Router, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from '@/contexts/theme-provider';
import { useRouterBase } from '@/lib/router-config';
import HomePage from '@/pages/home';
import NotFoundPage from '@/pages/not-found';

const queryClient = new QueryClient();

export default function App() {
  const { base } = useRouterBase();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router base={base}>
            <div className="min-h-screen bg-background">
              <Switch>
                <Route path="/" component={HomePage} />
                <Route component={NotFoundPage} />
              </Switch>
            </div>
            <Toaster />
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
