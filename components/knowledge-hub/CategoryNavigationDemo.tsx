'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TheoryCategory } from '@/types/knowledge-hub';
import { useState } from 'react';
import { CategoryNavigation } from './CategoryNavigation';

// Mock theory counts for demonstration
const mockTheoryCounts = {
  [TheoryCategory.COGNITIVE_BIASES]: 8,
  [TheoryCategory.PERSUASION_PRINCIPLES]: 6,
  [TheoryCategory.BEHAVIORAL_ECONOMICS]: 5,
  [TheoryCategory.UX_PSYCHOLOGY]: 7,
  [TheoryCategory.EMOTIONAL_TRIGGERS]: 4
};

export function CategoryNavigationDemo() {
  const [selectedCategory, setSelectedCategory] = useState<TheoryCategory | undefined>(undefined);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Category Navigation Demo</CardTitle>
          <CardDescription>
            This demonstrates the CategoryNavigation component with interactive filtering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Category Navigation Component */}
            <div>
              <CategoryNavigation
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                theoryCounts={mockTheoryCounts}
              />
            </div>

            {/* Selected Category Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Current Selection</h3>

              {selectedCategory ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">
                      {selectedCategory.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </CardTitle>
                    <CardDescription>
                      {mockTheoryCounts[selectedCategory]} theories available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">
                      You have selected the {selectedCategory.replace('-', ' ')} category.
                      In a real implementation, this would show filtered theories from this category.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <p className="text-gray-400 text-center">
                      No category selected. All theories are shown.
                    </p>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Total: {Object.values(mockTheoryCounts).reduce((sum, count) => sum + count, 0)} theories
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* State Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Component State</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify({ selectedCategory, theoryCounts: mockTheoryCounts }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
