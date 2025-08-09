'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface VoiceCommand {
  command: string;
  description: string;
  action: () => void;
  aliases?: string[];
}

interface VoiceNavigationProps {
  commands?: VoiceCommand[];
  className?: string;
}

export function VoiceNavigation({ commands = [], className }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { announceToScreenReader, preferences } = useAccessibility();

  // Default voice commands
  const defaultCommands: VoiceCommand[] = [
    {
      command: 'go to dashboard',
      description: 'Navigate to the main dashboard',
      action: () => {
        const dashboardLink = document.querySelector('[href*="dashboard"]') as HTMLAnchorElement;
        dashboardLink?.click();
      },
      aliases: ['dashboard', 'home', 'main']
    },
    {
      command: 'next step',
      description: 'Go to the next step in the current phase',
      action: () => {
        const nextButton = document.querySelector('[aria-label*="next"]') as HTMLButtonElement;
        nextButton?.click();
      },
      aliases: ['next', 'continue', 'proceed']
    },
    {
      command: 'previous step',
      description: 'Go to the previous step',
      action: () => {
        const prevButton = document.querySelector('[aria-label*="previous"]') as HTMLButtonElement;
        prevButton?.click();
      },
      aliases: ['previous', 'back', 'go back']
    },
    {
      command: 'save progress',
      description: 'Save current progress',
      action: () => {
        const saveButton = document.querySelector('[aria-label*="save"]') as HTMLButtonElement;
        saveButton?.click();
      },
      aliases: ['save', 'save progress']
    },
    {
      command: 'help',
      description: 'Show help information',
      action: () => {
        const helpButton = document.querySelector('[aria-label*="help"]') as HTMLButtonElement;
        helpButton?.click();
      },
      aliases: ['help', 'assistance', 'support']
    },
    {
      command: 'focus first',
      description: 'Focus the first interactive element',
      action: () => {
        const firstFocusable = document.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        firstFocusable?.focus();
      },
      aliases: ['first', 'focus first', 'go to first']
    },
    {
      command: 'focus last',
      description: 'Focus the last interactive element',
      action: () => {
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
        lastFocusable?.focus();
      },
      aliases: ['last', 'focus last', 'go to last']
    }
  ];

  const allCommands = [...defaultCommands, ...commands];

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        announceToScreenReader('Voice navigation started', 'polite');
      };

      recognition.onend = () => {
        setIsListening(false);
        announceToScreenReader('Voice navigation stopped', 'polite');
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        announceToScreenReader(`Voice navigation error: ${event.error}`, 'assertive');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Process voice commands
  const processVoiceCommand = useCallback((command: string) => {
    const matchedCommand = allCommands.find(cmd => {
      const commandText = cmd.command.toLowerCase();
      const aliases = cmd.aliases?.map(alias => alias.toLowerCase()) || [];

      return commandText === command ||
        aliases.includes(command) ||
        command.includes(commandText) ||
        aliases.some(alias => command.includes(alias));
    });

    if (matchedCommand) {
      setLastCommand(matchedCommand.command);
      announceToScreenReader(`Executing command: ${matchedCommand.command}`, 'polite');

      try {
        matchedCommand.action();
      } catch (error) {
        console.error('Error executing voice command:', error);
        announceToScreenReader('Error executing command', 'assertive');
      }
    } else {
      announceToScreenReader(`Command not recognized: ${command}`, 'polite');
    }
  }, [allCommands, announceToScreenReader]);

  // Start/stop voice recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }, [isListening]);

  // Don't render if not supported or not enabled
  if (!isSupported || !preferences.screenReaderMode) {
    return null;
  }

  return (
    <Card className={`${className} border-blue-200 bg-blue-50`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Volume2 className="h-4 w-4" />
          <span>Voice Navigation</span>
          {isListening && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Mic className="h-3 w-3 mr-1" />
              Listening
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-blue-700">
          Control the application using voice commands
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className="flex items-center space-x-2"
            aria-label={isListening ? "Stop voice navigation" : "Start voice navigation"}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Start Listening</span>
              </>
            )}
          </Button>

          {confidence > 0 && (
            <Badge variant="outline" className="text-xs">
              Confidence: {Math.round(confidence * 100)}%
            </Badge>
          )}
        </div>

        {/* Current transcript */}
        {transcript && (
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Current Speech:
            </div>
            <div className="text-sm text-gray-600">
              "{transcript}"
            </div>
          </div>
        )}

        {/* Last executed command */}
        {lastCommand && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Last command: "{lastCommand}"
            </AlertDescription>
          </Alert>
        )}

        {/* Error display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Available commands */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Available Commands:</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {allCommands.slice(0, 6).map((cmd, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="font-medium text-gray-700">"{cmd.command}"</span>
                <span className="text-gray-500">{cmd.description}</span>
              </div>
            ))}

            {allCommands.length > 6 && (
              <div className="text-center text-gray-500 text-xs">
                +{allCommands.length - 6} more commands available
              </div>
            )}
          </div>
        </div>

        {/* Usage tips */}
        <div className="p-3 bg-blue-100 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">Tips:</div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Speak clearly and wait for the command to be recognized</li>
            <li>• Use natural language - aliases are supported</li>
            <li>• Commands work best in quiet environments</li>
            <li>• You can say "help" to get assistance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Floating voice navigation button
export function VoiceNavigationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences } = useAccessibility();

  if (!preferences.screenReaderMode) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50">
      {isOpen ? (
        <div className="mb-2">
          <VoiceNavigation />
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            aria-label="Close voice navigation"
          >
            <VolumeX className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          variant="default"
          size="sm"
          className="rounded-full shadow-lg"
          aria-label="Open voice navigation"
        >
          <Volume2 className="h-4 w-4" />
          <span className="sr-only">Voice Navigation</span>
        </Button>
      )}
    </div>
  );
}

// Hook for adding voice commands to components
export function useVoiceCommands(commands: VoiceCommand[]) {
  const { preferences } = useAccessibility();

  useEffect(() => {
    if (!preferences.screenReaderMode) return;

    // Commands are automatically picked up by the VoiceNavigation component
    // This hook can be extended to register commands globally
    console.log('Voice commands registered:', commands);
  }, [commands, preferences.screenReaderMode]);

  return {
    isVoiceEnabled: preferences.screenReaderMode,
    commands
  };
}
