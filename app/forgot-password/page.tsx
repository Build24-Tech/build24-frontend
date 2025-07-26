'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { user, resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      toast({
        title: "Success",
        description: "Password reset email sent! Check your inbox.",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to send reset email';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back to Login */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0 px-2">
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-400">
              {emailSent
                ? "We've sent you a password reset link"
                : "Enter your email to receive a password reset link"
              }
            </p>
          </div>

          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 mb-2">Email sent successfully!</p>
                <p className="text-sm text-gray-300">
                  Check your email inbox and click the reset link to create a new password.
                </p>
              </div>

              <div className="text-sm text-gray-400">
                Didn&apos;t receive the email?{' '}
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="text-yellow-400 hover:text-yellow-300 underline"
                >
                  Try again
                </button>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
                  <Link href="/login">
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Reset Password Form */}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-1 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold py-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  Send Reset Link
                </Button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-400">
                  Remember your password?{' '}
                  <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                    Sign in
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
