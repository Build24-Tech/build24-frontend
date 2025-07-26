'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/lib/firestore';
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const { user, signUp, signInWithGoogle, signInWithGithub, signInWithApple } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (!agreeToPolicy) {
      toast({
        title: "Error",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await signUp(formData.email, formData.password, formData.name);

      // Update the user profile with email preferences
      await createUserProfile(userCredential, 'onboarding', emailUpdates);

      toast({
        title: "Success",
        description: `Welcome to Build24, ${formData.name}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
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

  const handleSocialSignup = async (provider: 'google' | 'github' | 'apple') => {
    if (!agreeToPolicy) {
      toast({
        title: "Error",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    setSocialLoading(provider);
    try {
      let user;
      switch (provider) {
        case 'google':
          user = await signInWithGoogle();
          break;
        case 'github':
          user = await signInWithGithub();
          break;
        case 'apple':
          user = await signInWithApple();
          break;
      }

      // Update user profile with email preferences
      await createUserProfile(user, 'onboarding', emailUpdates);

      toast({
        title: "Success",
        description: `Welcome to Build24, ${user.displayName || user.email}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(`${provider} signup error:`, error);
      let errorMessage = `Failed to sign up with ${provider}`;

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign up was cancelled';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method';
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back to Home */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Join <span className="text-yellow-400">Build24</span>
            </h1>
            <p className="text-gray-400">
              Create your account to follow the journey
            </p>
          </div>

          {/* Social Signup Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handleSocialSignup('google')}
              disabled={socialLoading !== null}
              className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3"
            >
              {socialLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              onClick={() => handleSocialSignup('github')}
              disabled={socialLoading !== null}
              className="w-full bg-gray-800 text-white hover:bg-gray-700 font-medium py-3"
            >
              {socialLoading === 'github' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              Continue with GitHub
            </Button>

            <Button
              onClick={() => handleSocialSignup('apple')}
              disabled={socialLoading !== null}
              className="w-full bg-black border border-gray-600 text-white hover:bg-gray-900 font-medium py-3"
            >
              {socialLoading === 'apple' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or sign up with email</span>
            </div>
          </div>

          {/* Email Signup Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="mt-1 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="mt-1 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min. 6 characters)"
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="emailUpdates"
                  checked={emailUpdates}
                  onCheckedChange={(checked) => setEmailUpdates(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                />
                <Label htmlFor="emailUpdates" className="text-sm text-gray-300 leading-5">
                  I want to receive email updates about Build24&apos;s progress, new projects, and behind-the-scenes insights
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToPolicy"
                  checked={agreeToPolicy}
                  onCheckedChange={(checked) => setAgreeToPolicy(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                />
                <Label htmlFor="agreeToPolicy" className="text-sm text-gray-300 leading-5">
                  I agree to the{' '}
                  <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold py-3 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
