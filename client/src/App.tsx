import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Router, Switch } from 'wouter';
import { RTLWrapper } from './components/rtl-wrapper'; // Ensure the import path is correct
import { Toaster } from './components/ui/toaster';
import { LanguageProvider } from './contexts/language-context';
import { ThemeProvider } from './contexts/theme-provider';
import { getRouterBase } from './lib/router-config';
import HomePage from './pages/home';
import NotFoundPage from './pages/not-found';

const queryClient = new QueryClient();

export default function App() {
  const { base } = getRouterBase();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <RTLWrapper>
            {' '}
            {/* Wrap the Router with RTLWrapper */}
            <Router base={base}>
              <div className="min-h-screen bg-background">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route component={NotFoundPage} />
                </Switch>
              </div>
              <Toaster />
            </Router>
          </RTLWrapper>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
