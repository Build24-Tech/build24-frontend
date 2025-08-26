'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Accessibility,
  CheckCircle,
  Eye,
  Info,
  Keyboard,
  Settings,
  Volume2
} from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilitySettingsProps {
  className?: string;
}

export function AccessibilitySettings({ className }: AccessibilitySettingsProps) {
  const {
    preferences,
    updatePreferences,
    announceToScreenReader,
    isHighContrast,
    isReducedMotion
  } = useAccessibility();

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });

    // Announce changes to screen readers
    const labels = {
      highContrast: 'High contrast mode',
      reducedMotion: 'Reduced motion',
      largeText: 'Large text',
      screenReaderMode: 'Screen reader optimizations',
      keyboardNavigation: 'Enhanced keyboard navigation'
    };

    announceToScreenReader(
      `${labels[key]} ${value ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  const resetToDefaults = () => {
    updatePreferences({
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReaderMode: false,
      keyboardNavigation: false,
    });
    announceToScreenReader('Accessibility settings reset to defaults', 'polite');
  };

  const detectSystemSettings = () => {
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    updatePreferences({
      highContrast,
      reducedMotion,
    });

    announceToScreenReader('System accessibility preferences detected and applied', 'polite');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${className} relative`}
          aria-label="Open accessibility settings"
        >
          <Accessibility className="h-4 w-4 mr-2" />
          Accessibility
          {(preferences.highContrast || preferences.reducedMotion || preferences.largeText ||
            preferences.screenReaderMode || preferences.keyboardNavigation) && (
              <Badge
                variant="secondary"
                className="ml-2 h-2 w-2 p-0 rounded-full bg-blue-500"
                aria-label="Accessibility settings active"
              />
            )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        aria-describedby="accessibility-settings-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Accessibility className="h-5 w-5" />
            <span>Accessibility Settings</span>
          </DialogTitle>
          <DialogDescription id="accessibility-settings-description">
            Customize your experience with accessibility features. These settings will be remembered for your next visit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={detectSystemSettings}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Detect System Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs"
            >
              Reset to Defaults
            </Button>
          </div>

          <Separator />

          {/* Visual Accessibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Visual Accessibility</span>
              </CardTitle>
              <CardDescription>
                Adjust visual elements for better visibility and readability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increases contrast between text and background colors
                  </p>
                  {isHighContrast && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      System detected
                    </Badge>
                  )}
                </div>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => handlePreferenceChange('highContrast', checked)}
                  aria-describedby="high-contrast-description"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="large-text" className="text-sm font-medium">
                    Large Text
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increases font size throughout the application
                  </p>
                </div>
                <Switch
                  id="large-text"
                  checked={preferences.largeText}
                  onCheckedChange={(checked) => handlePreferenceChange('largeText', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion" className="text-sm font-medium">
                    Reduced Motion
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Minimizes animations and transitions
                  </p>
                  {isReducedMotion && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      System detected
                    </Badge>
                  )}
                </div>
                <Switch
                  id="reduced-motion"
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => handlePreferenceChange('reducedMotion', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Accessibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Keyboard className="h-4 w-4" />
                <span>Navigation Accessibility</span>
              </CardTitle>
              <CardDescription>
                Enhance navigation and interaction methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-navigation" className="text-sm font-medium">
                    Enhanced Keyboard Navigation
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Improves focus indicators and keyboard shortcuts
                  </p>
                </div>
                <Switch
                  id="keyboard-navigation"
                  checked={preferences.keyboardNavigation}
                  onCheckedChange={(checked) => handlePreferenceChange('keyboardNavigation', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Screen Reader Accessibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Screen Reader Accessibility</span>
              </CardTitle>
              <CardDescription>
                Optimize the experience for screen reader users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader-mode" className="text-sm font-medium">
                    Screen Reader Optimizations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enhances ARIA labels and provides additional context
                  </p>
                </div>
                <Switch
                  id="screen-reader-mode"
                  checked={preferences.screenReaderMode}
                  onCheckedChange={(checked) => handlePreferenceChange('screenReaderMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Navigation</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> - Next element</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift+Tab</kbd> - Previous element</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Arrow keys</kbd> - Navigate lists</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter/Space</kbd> - Activate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Application</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Escape</kbd> - Close dialogs</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+S</kbd> - Save progress</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Z</kbd> - Undo</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">F1</kbd> - Help</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Current Status</p>
                  <p className="text-blue-700 text-xs">
                    {Object.values(preferences).some(Boolean)
                      ? `${Object.values(preferences).filter(Boolean).length} accessibility feature(s) enabled`
                      : 'No accessibility features currently enabled'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Floating accessibility button for quick access
export function AccessibilityFloatingButton() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AccessibilitySettings />
    </div>
  );
}
