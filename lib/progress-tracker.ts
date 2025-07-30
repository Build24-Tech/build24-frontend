import {
  LaunchPhase,
  StepProgress,
  StepStatus,
  UserProgress,
  ValidationResult
} from '@/types/launch-essentials';
import { UserProgressService } from './launch-essentials-firestore';
import {
  calculateOverallProgress,
  calculatePhaseCompletion,
  getNextPhase,
  getNextStep
} from './launch-essentials-utils';

// Error classes for progress tracking
export class ProgressTrackingError extends Error {
  constructor(
    public operation: string,
    public originalError: Error,
    public context?: any
  ) {
    super(`Progress tracking failed during ${operation}: ${originalError.message}`);
    this.name = 'ProgressTrackingError';
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string
  ) {
    super(`Validation error in ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

// Auto-save configuration
interface AutoSaveConfig {
  enabled: boolean;
  debounceMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

// Progress update options
interface ProgressUpdateOptions {
  autoSave?: boolean;
  optimistic?: boolean;
  validateData?: boolean;
  retryOnFailure?: boolean;
}

// Progress calculation result
interface ProgressCalculation {
  phaseCompletion: Record<LaunchPhase, number>;
  overallCompletion: number;
  completedSteps: number;
  totalSteps: number;
  nextStep: StepProgress | null;
  nextPhase: LaunchPhase | null;
}

/**
 * Core progress tracking service that manages user progress across frameworks
 */
export class ProgressTracker {
  private autoSaveConfig: AutoSaveConfig;
  private pendingUpdates: Map<string, NodeJS.Timeout> = new Map();
  private optimisticUpdates: Map<string, UserProgress> = new Map();
  private retryQueue: Map<string, { operation: () => Promise<void>; retries: number }> = new Map();

  constructor(autoSaveConfig?: Partial<AutoSaveConfig>) {
    this.autoSaveConfig = {
      enabled: true,
      debounceMs: 2000,
      maxRetries: 3,
      retryDelayMs: 1000,
      ...autoSaveConfig
    };
  }

  /**
   * Initialize progress tracking for a user and project
   */
  async initializeProgress(
    userId: string,
    projectId: string,
    initialPhase: LaunchPhase = 'validation'
  ): Promise<UserProgress> {
    try {
      // Check if progress already exists
      const existingProgress = await UserProgressService.getUserProgress(userId, projectId);
      if (existingProgress) {
        return existingProgress;
      }

      // Create new progress
      const progress = await UserProgressService.createUserProgress(userId, projectId, initialPhase);

      // Initialize optimistic cache
      const progressKey = this.getProgressKey(userId, projectId);
      this.optimisticUpdates.set(progressKey, progress);

      return progress;
    } catch (error) {
      throw new ProgressTrackingError('initialize', error as Error, { userId, projectId });
    }
  }

  /**
   * Get current progress with optimistic updates applied
   */
  async getProgress(userId: string, projectId: string): Promise<UserProgress | null> {
    try {
      const progressKey = this.getProgressKey(userId, projectId);

      // Return optimistic update if available
      if (this.optimisticUpdates.has(progressKey)) {
        return this.optimisticUpdates.get(progressKey)!;
      }

      // Fetch from database
      const progress = await UserProgressService.getUserProgress(userId, projectId);
      if (progress) {
        this.optimisticUpdates.set(progressKey, progress);
      }

      return progress;
    } catch (error) {
      throw new ProgressTrackingError('get', error as Error, { userId, projectId });
    }
  }

  /**
   * Update step progress with auto-save and optimistic updates
   */
  async updateStepProgress(
    userId: string,
    projectId: string,
    phase: LaunchPhase,
    stepId: string,
    status: StepStatus,
    data?: any,
    notes?: string,
    options: ProgressUpdateOptions = {}
  ): Promise<UserProgress> {
    const {
      autoSave = this.autoSaveConfig.enabled,
      optimistic = true,
      validateData = true,
      retryOnFailure = true
    } = options;

    try {
      const progressKey = this.getProgressKey(userId, projectId);
      let currentProgress = await this.getProgress(userId, projectId);

      if (!currentProgress) {
        currentProgress = await this.initializeProgress(userId, projectId, phase);
      }

      // Validate data if requested
      if (validateData && data !== undefined) {
        const validation = this.validateStepData(stepId, data);
        if (!validation.isValid) {
          throw new ValidationError(stepId, validation.errors[0]?.message || 'Invalid data', 'VALIDATION_FAILED');
        }
      }

      // Create updated progress
      const updatedProgress = this.createUpdatedProgress(
        currentProgress,
        phase,
        stepId,
        status,
        data,
        notes
      );

      // Apply optimistic update
      if (optimistic) {
        this.optimisticUpdates.set(progressKey, updatedProgress);
      }

      // Handle persistence
      if (autoSave) {
        this.scheduleAutoSave(userId, projectId, phase, stepId, status, data, notes, retryOnFailure);
      } else {
        await this.persistStepUpdate(userId, projectId, phase, stepId, status, data, notes);
      }

      return updatedProgress;
    } catch (error) {
      throw new ProgressTrackingError('updateStep', error as Error, {
        userId, projectId, phase, stepId, status
      });
    }
  }

  /**
   * Update current phase
   */
  async updateCurrentPhase(
    userId: string,
    projectId: string,
    newPhase: LaunchPhase,
    options: ProgressUpdateOptions = {}
  ): Promise<UserProgress> {
    const { optimistic = true, retryOnFailure = true } = options;

    try {
      const progressKey = this.getProgressKey(userId, projectId);
      let currentProgress = await this.getProgress(userId, projectId);

      if (!currentProgress) {
        throw new Error('Progress not found');
      }

      // Create updated progress
      const updatedProgress = {
        ...currentProgress,
        currentPhase: newPhase,
        updatedAt: new Date()
      };

      // Apply optimistic update
      if (optimistic) {
        this.optimisticUpdates.set(progressKey, updatedProgress);
      }

      // Persist change
      const persistOperation = async () => {
        await UserProgressService.updateCurrentPhase(userId, projectId, newPhase);
      };

      if (retryOnFailure) {
        await this.executeWithRetry(progressKey, persistOperation);
      } else {
        await persistOperation();
      }

      return updatedProgress;
    } catch (error) {
      throw new ProgressTrackingError('updatePhase', error as Error, {
        userId, projectId, newPhase
      });
    }
  }

  /**
   * Calculate comprehensive progress metrics
   */
  calculateProgress(progress: UserProgress): ProgressCalculation {
    const phaseCompletion: Record<LaunchPhase, number> = {} as Record<LaunchPhase, number>;
    let totalSteps = 0;
    let completedSteps = 0;

    // Calculate phase completions
    Object.entries(progress.phases).forEach(([phase, phaseProgress]) => {
      const completion = calculatePhaseCompletion(phaseProgress.steps);
      phaseCompletion[phase as LaunchPhase] = completion;

      totalSteps += phaseProgress.steps.length;
      completedSteps += phaseProgress.steps.filter(step => step.status === 'completed').length;
    });

    const overallCompletion = calculateOverallProgress(progress);
    const nextStep = getNextStep(progress);
    const nextPhase = getNextPhase(progress);

    return {
      phaseCompletion,
      overallCompletion,
      completedSteps,
      totalSteps,
      nextStep,
      nextPhase
    };
  }

  /**
   * Get progress summary with recommendations
   */
  async getProgressSummary(userId: string, projectId: string): Promise<{
    progress: UserProgress;
    calculation: ProgressCalculation;
    recommendations: string[];
    risks: string[];
  }> {
    try {
      const progress = await this.getProgress(userId, projectId);
      if (!progress) {
        throw new Error('Progress not found');
      }

      const calculation = this.calculateProgress(progress);
      const recommendations = this.generateRecommendations(progress, calculation);
      const risks = this.identifyRisks(progress, calculation);

      return {
        progress,
        calculation,
        recommendations,
        risks
      };
    } catch (error) {
      throw new ProgressTrackingError('getSummary', error as Error, { userId, projectId });
    }
  }

  /**
   * Force save all pending changes
   */
  async forceSave(userId: string, projectId: string): Promise<void> {
    const progressKey = this.getProgressKey(userId, projectId);

    // Cancel pending auto-save
    const pendingTimeout = this.pendingUpdates.get(progressKey);
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      this.pendingUpdates.delete(progressKey);
    }

    // Execute any queued retry operations
    const retryOperation = this.retryQueue.get(progressKey);
    if (retryOperation) {
      await retryOperation.operation();
      this.retryQueue.delete(progressKey);
    }
  }

  /**
   * Clear optimistic updates and refresh from database
   */
  async refreshProgress(userId: string, projectId: string): Promise<UserProgress | null> {
    const progressKey = this.getProgressKey(userId, projectId);

    // Clear optimistic updates
    this.optimisticUpdates.delete(progressKey);

    // Fetch fresh data
    return await UserProgressService.getUserProgress(userId, projectId);
  }

  /**
   * Subscribe to real-time progress updates
   */
  subscribeToProgress(
    userId: string,
    projectId: string,
    callback: (progress: UserProgress | null) => void
  ): () => void {
    return UserProgressService.subscribeToUserProgress(userId, projectId, (progress) => {
      if (progress) {
        const progressKey = this.getProgressKey(userId, projectId);
        // Update optimistic cache with fresh data
        this.optimisticUpdates.set(progressKey, progress);
      }
      callback(progress);
    });
  }

  // Private helper methods

  private getProgressKey(userId: string, projectId: string): string {
    return `${userId}_${projectId}`;
  }

  private createUpdatedProgress(
    currentProgress: UserProgress,
    phase: LaunchPhase,
    stepId: string,
    status: StepStatus,
    data?: any,
    notes?: string
  ): UserProgress {
    const updatedProgress = { ...currentProgress };
    const phaseProgress = { ...updatedProgress.phases[phase] };

    // Update or add step
    const existingStepIndex = phaseProgress.steps.findIndex(step => step.stepId === stepId);
    const stepProgress: StepProgress = {
      stepId,
      status,
      data: data || {},
      completedAt: status === 'completed' ? new Date() : undefined,
      notes
    };

    if (existingStepIndex >= 0) {
      phaseProgress.steps = [...phaseProgress.steps];
      phaseProgress.steps[existingStepIndex] = stepProgress;
    } else {
      phaseProgress.steps = [...phaseProgress.steps, stepProgress];
    }

    // Recalculate phase completion
    phaseProgress.completionPercentage = calculatePhaseCompletion(phaseProgress.steps);

    // Mark phase as completed if all steps are done
    if (phaseProgress.completionPercentage === 100 && !phaseProgress.completedAt) {
      phaseProgress.completedAt = new Date();
    }

    updatedProgress.phases = {
      ...updatedProgress.phases,
      [phase]: phaseProgress
    };
    updatedProgress.updatedAt = new Date();

    return updatedProgress;
  }

  private scheduleAutoSave(
    userId: string,
    projectId: string,
    phase: LaunchPhase,
    stepId: string,
    status: StepStatus,
    data?: any,
    notes?: string,
    retryOnFailure: boolean = true
  ): void {
    const progressKey = this.getProgressKey(userId, projectId);

    // Cancel existing timeout
    const existingTimeout = this.pendingUpdates.get(progressKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new save
    const timeout = setTimeout(async () => {
      try {
        await this.persistStepUpdate(userId, projectId, phase, stepId, status, data, notes);
        this.pendingUpdates.delete(progressKey);
      } catch (error) {
        if (retryOnFailure) {
          this.scheduleRetry(progressKey, async () => {
            await this.persistStepUpdate(userId, projectId, phase, stepId, status, data, notes);
          });
        }
      }
    }, this.autoSaveConfig.debounceMs);

    this.pendingUpdates.set(progressKey, timeout);
  }

  private async persistStepUpdate(
    userId: string,
    projectId: string,
    phase: LaunchPhase,
    stepId: string,
    status: StepStatus,
    data?: any,
    notes?: string
  ): Promise<void> {
    await UserProgressService.updateStepProgress(
      userId,
      projectId,
      phase,
      stepId,
      status,
      data || {},
      notes
    );
  }

  private scheduleRetry(progressKey: string, operation: () => Promise<void>): void {
    const existingRetry = this.retryQueue.get(progressKey);
    const retries = existingRetry ? existingRetry.retries + 1 : 1;

    if (retries <= this.autoSaveConfig.maxRetries) {
      setTimeout(async () => {
        try {
          await operation();
          this.retryQueue.delete(progressKey);
        } catch (error) {
          this.scheduleRetry(progressKey, operation);
        }
      }, this.autoSaveConfig.retryDelayMs * retries);

      this.retryQueue.set(progressKey, { operation, retries });
    } else {
      // Max retries exceeded, remove from queue
      this.retryQueue.delete(progressKey);
      console.error(`Max retries exceeded for progress update: ${progressKey}`);
    }
  }

  private async executeWithRetry(progressKey: string, operation: () => Promise<void>): Promise<void> {
    let retries = 0;

    while (retries <= this.autoSaveConfig.maxRetries) {
      try {
        await operation();
        return;
      } catch (error) {
        retries++;
        if (retries > this.autoSaveConfig.maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.autoSaveConfig.retryDelayMs * retries));
      }
    }
  }

  private validateStepData(stepId: string, data: any): ValidationResult {
    // Basic validation - can be extended with specific step schemas
    const errors: any[] = [];

    if (data === null) {
      errors.push({
        field: stepId,
        message: 'Step data cannot be null',
        code: 'REQUIRED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateRecommendations(progress: UserProgress, calculation: ProgressCalculation): string[] {
    const recommendations: string[] = [];

    // Next step recommendation
    if (calculation.nextStep) {
      recommendations.push(`Complete step: ${calculation.nextStep.stepId}`);
    }

    // Phase progression recommendation
    if (calculation.nextPhase && calculation.nextPhase !== progress.currentPhase) {
      recommendations.push(`Consider moving to ${calculation.nextPhase} phase`);
    }

    // Completion recommendations
    if (calculation.overallCompletion < 25) {
      recommendations.push('Focus on completing validation phase first');
    } else if (calculation.overallCompletion < 50) {
      recommendations.push('Define your product clearly before moving to technical planning');
    } else if (calculation.overallCompletion < 75) {
      recommendations.push('Start planning your go-to-market strategy');
    } else {
      recommendations.push('Prepare for launch - review all phases for completeness');
    }

    return recommendations;
  }

  private identifyRisks(progress: UserProgress, calculation: ProgressCalculation): string[] {
    const risks: string[] = [];

    // Incomplete validation risks
    const validationCompletion = calculation.phaseCompletion.validation || 0;
    if (validationCompletion < 80 && progress.currentPhase !== 'validation') {
      risks.push('Insufficient market validation may lead to product-market fit issues');
    }

    // Technical planning risks
    const technicalCompletion = calculation.phaseCompletion.technical || 0;
    if (technicalCompletion < 60 && calculation.overallCompletion > 50) {
      risks.push('Technical architecture planning is lagging behind other phases');
    }

    // Financial planning risks
    const financialCompletion = calculation.phaseCompletion.financial || 0;
    if (financialCompletion < 40 && calculation.overallCompletion > 60) {
      risks.push('Financial planning needs attention before launch');
    }

    return risks;
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();
