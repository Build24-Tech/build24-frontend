'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with your newsletter service (e.g., ConvertKit, Mailchimp)
    console.log('Subscribing email:', email);
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <section className="py-20 bg-yellow-400/5">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 text-lg mb-8">
            Get notified when new projects are completed and follow the Build24 journey in real-time.
          </p>
          
          {isSubscribed ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <p className="text-green-400 font-medium">
                🎉 Thanks for subscribing! You'll receive updates on the Build24 journey.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 flex-1"
              />
              <Button 
                type="submit" 
                className="bg-yellow-400 text-black hover:bg-yellow-500 px-8"
              >
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}