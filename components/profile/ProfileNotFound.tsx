'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Home, Search, UserX } from 'lucide-react';
import Link from 'next/link';

interface ProfileNotFoundProps {
  userId?: string;
  message?: string;
}

export function ProfileNotFound({
  userId,
  message = "The profile you're looking for doesn't exist or has been removed."
}: ProfileNotFoundProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <UserX className="w-12 h-12 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Profile Not Found</h1>
            </div>
          </div>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground max-w-md mx-auto">
              {message}
            </p>

            {userId && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  User ID: <code className="bg-muted px-2 py-1 rounded text-xs">{userId}</code>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Here are some things you can try:
            </p>

            <div className="grid gap-3 max-w-sm mx-auto">
              <Button variant="outline" asChild className="justify-start">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="justify-start">
                <Link href="/dashboard/knowledge-hub" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Browse Knowledge Hub
                </Link>
              </Button>

              <Button variant="outline" asChild className="justify-start">
                <Link href="/blog" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Read Blog Posts
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
