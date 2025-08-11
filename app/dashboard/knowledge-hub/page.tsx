'use client';

import { ContentRecommendationPanel } from '@/components/knowledge-hub/ContentRecommendationPanel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { href } from '@/lib/language-utils';
import { TheoryCategory } from '@/types/knowledge-hub';
import { UserLanguage } from '@/types/user';
import { BookOpen, Brain, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const categories = [
  {
    id: 'cognitive-biases',
    name: 'Cognitive Biases',
    description: 'Understanding how the mind makes decisions and shortcuts',
    icon: Brain,
    count: 8,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    category: TheoryCategory.COGNITIVE_BIASES
  },
  {
    id: 'persuasion-principles',
    name: 'Persuasion Principles',
    description: 'Proven techniques for influencing behavior and decisions',
    icon: Users,
    count: 6,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    category: TheoryCategory.PERSUASION_PRINCIPLES
  },
  {
    id: 'behavioral-economics',
    name: 'Behavioral Economics',
    description: 'How psychology affects economic decisions',
    icon: TrendingUp,
    count: 5,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS
  },
  {
    id: 'ux-psychology',
    name: 'UX Psychology',
    description: 'Psychological principles for better user experiences',
    icon: Zap,
    count: 7,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    category: TheoryCategory.UX_PSYCHOLOGY
  },
  {
    id: 'emotional-triggers',
    name: 'Emotional Triggers',
    description: 'Understanding and leveraging emotional responses',
    icon: BookOpen,
    count: 4,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    category: TheoryCategory.EMOTIONAL_TRIGGERS
  }
];

export default function KnowledgeHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const currentLang = (params?.lang as UserLanguage) || 'en';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(href(currentLang, '/login'));
    }
  }, [user, loading, router, currentLang]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated and not loading, the useEffect will redirect
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Knowledge <span className="text-yellow-400">Hub</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover psychological theories and persuasion techniques to enhance your product building journey.
          Learn from behavioral science to create more engaging and effective products.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer group">
              <Link href={`/dashboard/knowledge-hub/category/${category.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                      {category.count} theories
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-yellow-400 transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-400">30+</CardTitle>
            <CardDescription>Psychological Theories</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-400">5</CardTitle>
            <CardDescription>Core Categories</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-400">∞</CardTitle>
            <CardDescription>Applications</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Trending Content */}
      <div className="mt-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContentRecommendationPanel
            categories={categories.map(cat => cat.category)}
            maxRecommendations={6}
            showTrending={true}
          />
        </div>
        <div>
          <PopularContent limit={5} />
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to the Knowledge Hub? Here's how to make the most of it:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">1. Explore Categories</h4>
              <p className="text-sm text-gray-400">
                Browse through different psychological categories to find theories relevant to your current project.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">2. Bookmark Favorites</h4>
              <p className="text-sm text-gray-400">
                Save theories you find useful for quick reference during your building sessions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">3. Apply to Build24</h4>
              <p className="text-sm text-gray-400">
                Each theory includes practical applications specifically for indie makers and product builders.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">4. Track Progress</h4>
              <p className="text-sm text-gray-400">
                Earn badges and track your learning journey as you explore different concepts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
