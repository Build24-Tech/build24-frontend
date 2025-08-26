'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAFeatures } from '@/lib/mobile-optimization';
import { Download, Smartphone, Wifi, WifiOff, X } from 'lucide-react';
import { useState } from 'react';

interface PWAInstallerProps {
  className?: string;
}

export function PWAInstaller({ className }: PWAInstallerProps) {
  const { isInstallable, isOffline, installPWA } = usePWAFeatures();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-900">
              Install Launch Essentials
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-yellow-700">
          Install the app for a better mobile experience with offline access
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-yellow-700">
            <Download className="h-4 w-4" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-yellow-700">
            <Smartphone className="h-4 w-4" />
            <span>App-like experience</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-yellow-700">
            {isOffline ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            <span>{isOffline ? 'Currently offline' : 'Fast loading'}</span>
          </div>

          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            {isInstalling ? 'Installing...' : 'Install App'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOffline } = usePWAFeatures();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span>You're currently offline. Some features may be limited.</span>
      </div>
    </div>
  );
}
