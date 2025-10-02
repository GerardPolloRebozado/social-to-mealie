import './globals.css';
import { Providers } from './providers';
import SetupChecker from '@/components/SetupChecker';
import type React from 'react';

export const metadata = {
  title: 'Social to Mealie Plus',
  description: 'Convert social media recipes to Mealie format with database and configurations page',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          <SetupChecker>
            <div className="min-h-screen bg-background">
              <header className="border-b">
                <div className="container mx-auto py-4">
                  <nav className="flex space-x-4">
                    <a href="/" className="text-foreground hover:text-primary">
                      Home
                    </a>
                    <a href="/history" className="text-foreground hover:text-primary">
                      History
                    </a>
                    <a href="/config" className="text-foreground hover:text-primary">
                      Config
                    </a>
                  </nav>
                </div>
              </header>
              <main className="container mx-auto">
                {children}
              </main>
            </div>
          </SetupChecker>
        </Providers>
      </body>
    </html>
  );
}
