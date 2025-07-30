/**
 * Example usage of the ProgressTracker system
 * This file demonstrates how to use the progress tracking functionality
 */

import { ProgressTracker } from './progress-tracker';

// Example: Initialize and use progress tracker
export async function progressTrackerExample() {
  // Create a progress tracker instance
  const tracker = new ProgressTracker({
    enabled: true,
    debounceMs: 2000,
    maxRetries: 3,
    retryDelayMs: 1000
  });

  const userId = 'user-123';
  const projectId = 'project-456';

  try {
    // 1. Initialize progress for a new project
    console.log('Initializing progress...');
    const initialProgress = await tracker.initializeProgress(userId, projectId, 'validation');
    console.log('Initial progress:', {
      currentPhase: initialProgress.currentPhase,
      overallCompletion: tracker.calculateProgress(initialProgress).overallCompletion
    });

    // 2. Update step progress with auto-save
    console.log('\nUpdating step progress...');
    const updatedProgress = await tracker.updateStepProgress(
      userId,
      projectId,
      'validation',
      'market-research',
      'completed',
      {
        marketSize: 1000000,
        growthRate: 15,
        trends: ['AI adoption', 'Remote work'],
        sources: ['Industry Report 2024', 'Market Analysis']
      },
      'Completed comprehensive market research'
    );

    // 3. Calculate progress metrics
    const calculation = tracker.calculateProgress(updatedProgress);
    console.log('Progress calculation:', {
      overallCompletion: calculation.overallCompletion,
      phaseCompletion: calculation.phaseCompletion.validation,
      nextStep: calculation.nextStep?.stepId,
      completedSteps: calculation.completedSteps,
      totalSteps: calculation.totalSteps
    });

    // 4. Add more steps to the validation phase
    await tracker.updateStepProgress(
      userId,
      projectId,
      'validation',
      'competitor-analysis',
      'in_progress',
      {
        competitors: [
          {
            name: 'Competitor A',
            strengths: ['Strong brand', 'Large user base'],
            weaknesses: ['High pricing', 'Poor UX'],
            marketShare: 25,
            pricing: 99
          }
        ]
      }
    );

    await tracker.updateStepProgress(
      userId,
      projectId,
      'validation',
      'target-audience',
      'completed',
      {
        personas: [
          {
            id: 'persona-1',
            name: 'Tech Entrepreneur',
            demographics: {
              age: '25-35',
              location: 'Urban areas',
              occupation: 'Startup founder',
              income: '$75k-150k'
            },
            psychographics: {
              goals: ['Scale business', 'Improve efficiency'],
              painPoints: ['Time management', 'Resource constraints'],
              motivations: ['Success', 'Innovation'],
              behaviors: ['Early adopter', 'Tech-savvy']
            },
            technographics: {
              devices: ['MacBook', 'iPhone'],
              platforms: ['Web', 'Mobile'],
              techSavviness: 'high' as const
            }
          }
        ],
        validationScore: 85
      }
    );

    // 5. Get comprehensive progress summary
    const summary = await tracker.getProgressSummary(userId, projectId);
    console.log('\nProgress Summary:', {
      overallCompletion: summary.calculation.overallCompletion,
      currentPhase: summary.progress.currentPhase,
      recommendations: summary.recommendations,
      risks: summary.risks
    });

    // 6. Move to next phase when validation is complete
    if (summary.calculation.phaseCompletion.validation === 100) {
      console.log('\nValidation phase complete, moving to definition phase...');
      await tracker.updateCurrentPhase(userId, projectId, 'definition');

      // Start working on product definition
      await tracker.updateStepProgress(
        userId,
        projectId,
        'definition',
        'vision-statement',
        'completed',
        {
          statement: 'To empower entrepreneurs with AI-driven tools for rapid product development',
          missionAlignment: 'Aligned with company mission to democratize technology'
        }
      );
    }

    // 7. Subscribe to real-time updates (in a real app)
    const unsubscribe = tracker.subscribeToProgress(userId, projectId, (progress) => {
      if (progress) {
        console.log('Real-time update:', {
          phase: progress.currentPhase,
          lastUpdated: progress.updatedAt
        });
      }
    });

    // 8. Force save any pending changes
    await tracker.forceSave(userId, projectId);

    // 9. Get final progress state
    const finalProgress = await tracker.getProgress(userId, projectId);
    const finalCalculation = tracker.calculateProgress(finalProgress!);

    console.log('\nFinal Progress State:', {
      overallCompletion: finalCalculation.overallCompletion,
      completedPhases: Object.entries(finalCalculation.phaseCompletion)
        .filter(([_, completion]) => completion === 100)
        .map(([phase, _]) => phase),
      nextRecommendedAction: finalCalculation.nextStep?.stepId || 'All steps complete!'
    });

    // Clean up subscription
    unsubscribe();

    return finalProgress;

  } catch (error) {
    console.error('Progress tracking example failed:', error);
    throw error;
  }
}

// Example: Error handling and recovery
export async function progressTrackerErrorHandlingExample() {
  const tracker = new ProgressTracker({
    enabled: true,
    debounceMs: 1000,
    maxRetries: 2,
    retryDelayMs: 500
  });

  const userId = 'user-789';
  const projectId = 'project-error-test';

  try {
    // Initialize progress
    await tracker.initializeProgress(userId, projectId);

    // Simulate network issues with optimistic updates
    console.log('Testing error handling with optimistic updates...');

    // This will succeed optimistically even if persistence fails
    const result = await tracker.updateStepProgress(
      userId,
      projectId,
      'validation',
      'test-step',
      'completed',
      { test: 'data' },
      'Test note',
      {
        autoSave: true,
        optimistic: true,
        retryOnFailure: true
      }
    );

    console.log('Optimistic update succeeded:', {
      stepStatus: result.phases.validation.steps[0]?.status,
      stepData: result.phases.validation.steps[0]?.data
    });

    // Refresh to get actual persisted state
    const refreshedProgress = await tracker.refreshProgress(userId, projectId);
    console.log('Refreshed progress:', refreshedProgress?.phases.validation.steps.length || 0, 'steps');

  } catch (error) {
    console.error('Error handling example failed:', error);
  }
}

// Example: Batch operations and performance
export async function progressTrackerPerformanceExample() {
  const tracker = new ProgressTracker({
    enabled: true,
    debounceMs: 500, // Faster debounce for batch operations
    maxRetries: 1,
    retryDelayMs: 200
  });

  const userId = 'user-performance';
  const projectId = 'project-batch';

  try {
    console.log('Testing batch operations...');

    // Initialize progress
    await tracker.initializeProgress(userId, projectId);

    // Simulate rapid updates (like user typing in a form)
    const batchUpdates = [];
    for (let i = 0; i < 10; i++) {
      batchUpdates.push(
        tracker.updateStepProgress(
          userId,
          projectId,
          'validation',
          `step-${i}`,
          i % 3 === 0 ? 'completed' : 'in_progress',
          { iteration: i, timestamp: Date.now() },
          `Batch update ${i}`
        )
      );
    }

    // Execute all updates concurrently
    const results = await Promise.all(batchUpdates);

    console.log('Batch updates completed:', {
      totalUpdates: results.length,
      finalStepCount: results[results.length - 1].phases.validation.steps.length,
      completionPercentage: results[results.length - 1].phases.validation.completionPercentage
    });

    // Force save to ensure all changes are persisted
    await tracker.forceSave(userId, projectId);

  } catch (error) {
    console.error('Performance example failed:', error);
  }
}

// Export all examples for easy testing
export const examples = {
  basic: progressTrackerExample,
  errorHandling: progressTrackerErrorHandlingExample,
  performance: progressTrackerPerformanceExample
};
