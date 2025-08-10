'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, BookOpen, Clock, Star, Target, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  // Mock user progress data - this will be replaced with actual user data in future tasks
  const userProgress = {
    theoriesRead: 3,
    totalTheories: 30,
    readingTime: 45, // minutes
    categoriesExplored: 2,
    totalCategories: 5,
    bookmarksCount: 1,
    badges: [
      {
        id: 'first-theory',
        name: 'First Steps',
        description: 'Read your first theory',
        earnedAt: new Date('2024-01-20'),
        category: 'milestone'
      }
    ],
    recentActivity: [
      {
        type: 'theory_read',
        theoryTitle: 'Anchoring Bias',
        date: new Date('2024-01-20'),
        category: 'cognitive-biases'
      }
    ]
  };

  const progressPercentage = (userProgress.theoriesRead / userProgress.totalTheories) * 100;
  const categoryProgress = (userProgress.categoriesExplored / userProgress.totalCategories) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Your <span className="text-yellow-400">Progress</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Track your learning journey through psychological theories and behavioral science concepts.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center pb-4">
            <BookOpen className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <CardTitle className="text-2xl text-yellow-400">
              {userProgress.theoriesRead}
            </CardTitle>
            <CardDescription>Theories Read</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="mb-2" />
            <p className="text-sm text-gray-400 text-center">
              {userProgress.theoriesRead} of {userProgress.totalTheories} theories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center pb-4">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <CardTitle className="text-2xl text-yellow-400">
              {userProgress.readingTime}
            </CardTitle>
            <CardDescription>Minutes Reading</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-400">
              Time spent learning
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center pb-4">
            <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <CardTitle className="text-2xl text-yellow-400">
              {userProgress.categoriesExplored}
            </CardTitle>
            <CardDescription>Categories Explored</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={categoryProgress} className="mb-2" />
            <p className="text-sm text-gray-400 text-center">
              {userProgress.categoriesExplored} of {userProgress.totalCategories} categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Your Badges
          </CardTitle>
          <CardDescription>
            Achievements earned through your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProgress.badges.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProgress.badges.map((badge) => (
                <div key={badge.id} className="bg-gray-800 rounded-lg p-4 text-center">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-yellow-400 mb-1">{badge.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{badge.description}</p>
                  <p className="text-xs text-gray-500">
                    Earned {badge.earnedAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No badges earned yet. Keep reading to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest learning activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProgress.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {userProgress.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500/10 p-2 rounded-lg">
                      <BookOpen className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Read "{activity.theoryTitle}"</p>
                      <p className="text-sm text-gray-400">
                        {activity.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                    {activity.category.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No recent activity. Start exploring theories!</p>
              <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Link href="/dashboard/knowledge-hub">
                  Explore Knowledge Hub
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>
            Suggested next steps to advance your knowledge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Explore New Categories</h4>
              <p className="text-sm text-gray-400 mb-3">
                You've explored {userProgress.categoriesExplored} out of {userProgress.totalCategories} categories.
                Discover new psychological principles!
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/knowledge-hub">
                  Browse Categories
                </Link>
              </Button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Build Your Library</h4>
              <p className="text-sm text-gray-400 mb-3">
                You have {userProgress.bookmarksCount} bookmarked theories.
                Save more for quick reference during your projects.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/knowledge-hub/bookmarks">
                  View Bookmarks
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
