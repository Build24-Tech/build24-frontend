import {
  Framework,
  FrameworkSchema,
  LaunchPhase,
  PhaseProgress,
  ProjectData,
  ProjectDataSchema,
  StepProgress,
  UserProgress,
  UserProgressSchema,
  ValidationError,
  ValidationResult
} from '@/types/launch-essentials';

// Data Transformation Utilities

/**
 * Converts Firestore timestamp to Date object
 */
export function timestampToDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

/**
 * Converts Date object to Firestore timestamp format
 */
export function dateToTimestamp(date: Date) {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000
  };
}

/**
 * Serializes UserProgress for storage
 */
export function serializeUserProgress(progress: UserProgress): any {
  return {
    ...progress,
    createdAt: dateToTimestamp(progress.createdAt),
    updatedAt: dateToTimestamp(progress.updatedAt),
    completedAt: progress.completedAt ? dateToTimestamp(progress.completedAt) : null,
    phases: Object.fromEntries(
      Object.entries(progress.phases).map(([phase, phaseProgress]) => [
        phase,
        {
          ...phaseProgress,
          startedAt: dateToTimestamp(phaseProgress.startedAt),
          completedAt: phaseProgress.completedAt ? dateToTimestamp(phaseProgress.completedAt) : null,
          steps: phaseProgress.steps.map(step => ({
            ...step,
            completedAt: step.completedAt ? dateToTimestamp(step.completedAt) : null
          }))
        }
      ])
    )
  };
}

/**
 * Deserializes UserProgress from storage
 */
export function deserializeUserProgress(data: any): UserProgress {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    completedAt: data.completedAt ? timestampToDate(data.completedAt) : undefined,
    phases: Object.fromEntries(
      Object.entries(data.phases).map(([phase, phaseProgress]: [string, any]) => [
        phase,
        {
          ...phaseProgress,
          startedAt: timestampToDate(phaseProgress.startedAt),
          completedAt: phaseProgress.completedAt ? timestampToDate(phaseProgress.completedAt) : undefined,
          steps: phaseProgress.steps.map((step: any) => ({
            ...step,
            completedAt: step.completedAt ? timestampToDate(step.completedAt) : undefined
          }))
        }
      ])
    )
  };
}

/**
 * Serializes ProjectData for storage
 */
export function serializeProjectData(project: ProjectData): any {
  return {
    ...project,
    createdAt: dateToTimestamp(project.createdAt),
    updatedAt: dateToTimestamp(project.updatedAt)
  };
}

/**
 * Deserializes ProjectData from storage
 */
export function deserializeProjectData(data: any): ProjectData {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt)
  };
}

/**
 * Serializes Framework for storage
 */
export function serializeFramework(framework: Framework): any {
  return {
    ...framework,
    templates: framework.templates.map(template => ({
      ...template,
      createdAt: dateToTimestamp(template.createdAt),
      updatedAt: dateToTimestamp(template.updatedAt)
    }))
  };
}

/**
 * Deserializes Framework from storage
 */
export function deserializeFramework(data: any): Framework {
  return {
    ...data,
    templates: data.templates.map((template: any) => ({
      ...template,
      createdAt: timestampToDate(template.createdAt),
      updatedAt: timestampToDate(template.updatedAt)
    }))
  };
}

// Progress Calculation Utilities

/**
 * Calculates completion percentage for a phase
 */
export function calculatePhaseCompletion(steps: StepProgress[]): number {
  if (steps.length === 0) return 0;

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Calculates overall progress across all phases
 */
export function calculateOverallProgress(progress: UserProgress): number {
  const phases = Object.values(progress.phases);
  if (phases.length === 0) return 0;

  const totalCompletion = phases.reduce((sum, phase) => sum + phase.completionPercentage, 0);
  return Math.round(totalCompletion / phases.length);
}

/**
 * Gets the next incomplete step in the current phase
 */
export function getNextStep(progress: UserProgress): StepProgress | null {
  const currentPhase = progress.phases[progress.currentPhase];
  if (!currentPhase) return null;

  return currentPhase.steps.find(step =>
    step.status === 'not_started' || step.status === 'in_progress'
  ) || null;
}

/**
 * Gets all incomplete steps across all phases
 */
export function getIncompleteSteps(progress: UserProgress): StepProgress[] {
  const allSteps: StepProgress[] = [];

  Object.values(progress.phases).forEach(phase => {
    const incompleteSteps = phase.steps.filter(step =>
      step.status !== 'completed' && step.status !== 'skipped'
    );
    allSteps.push(...incompleteSteps);
  });

  return allSteps;
}

/**
 * Determines if a phase is complete
 */
export function isPhaseComplete(phase: PhaseProgress): boolean {
  return phase.steps.every(step =>
    step.status === 'completed' || step.status === 'skipped'
  );
}

/**
 * Gets the next phase to work on
 */
export function getNextPhase(progress: UserProgress): LaunchPhase | null {
  const phaseOrder: LaunchPhase[] = [
    'validation',
    'definition',
    'technical',
    'marketing',
    'operations',
    'financial',
    'risk',
    'optimization'
  ];

  const currentIndex = phaseOrder.indexOf(progress.currentPhase);

  for (let i = currentIndex; i < phaseOrder.length; i++) {
    const phase = progress.phases[phaseOrder[i]];
    if (phase && !isPhaseComplete(phase)) {
      return phaseOrder[i];
    }
  }

  return null;
}

// Validation Utilities

/**
 * Validates data against a schema and returns validation result
 */
export function validateData<T>(data: unknown, schema: any): ValidationResult {
  try {
    schema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error: any) {
    const errors: ValidationError[] = error.errors?.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    })) || [];

    return { isValid: false, errors };
  }
}

/**
 * Validates UserProgress data
 */
export function validateUserProgress(data: unknown): ValidationResult {
  return validateData(data, UserProgressSchema);
}

/**
 * Validates ProjectData
 */
export function validateProjectData(data: unknown): ValidationResult {
  return validateData(data, ProjectDataSchema);
}

/**
 * Validates Framework data
 */
export function validateFramework(data: unknown): ValidationResult {
  return validateData(data, FrameworkSchema);
}

// Data Generation Utilities

/**
 * Creates a new UserProgress instance with default values
 */
export function createDefaultUserProgress(
  userId: string,
  projectId: string
): UserProgress {
  const now = new Date();

  const createPhaseProgress = (phase: LaunchPhase): PhaseProgress => ({
    phase,
    steps: [],
    completionPercentage: 0,
    startedAt: now
  });

  return {
    userId,
    projectId,
    currentPhase: 'validation',
    phases: {
      validation: createPhaseProgress('validation'),
      definition: createPhaseProgress('definition'),
      technical: createPhaseProgress('technical'),
      marketing: createPhaseProgress('marketing'),
      operations: createPhaseProgress('operations'),
      financial: createPhaseProgress('financial'),
      risk: createPhaseProgress('risk'),
      optimization: createPhaseProgress('optimization')
    },
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Creates a new ProjectData instance with default values
 */
export function createDefaultProjectData(
  userId: string,
  name: string,
  description: string
): ProjectData {
  const now = new Date();

  return {
    id: generateId(),
    userId,
    name,
    description,
    industry: '',
    targetMarket: '',
    stage: 'concept',
    data: {},
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Data Export Utilities

/**
 * Exports project data to JSON format
 */
export function exportToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Exports project data to CSV format (simplified)
 */
export function exportToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

/**
 * Creates a summary of project progress
 */
export function createProgressSummary(progress: UserProgress): {
  overallCompletion: number;
  completedPhases: number;
  totalSteps: number;
  completedSteps: number;
  currentPhase: LaunchPhase;
  nextSteps: string[];
} {
  const phases = Object.values(progress.phases);
  const completedPhases = phases.filter(isPhaseComplete).length;

  const allSteps = phases.flatMap(phase => phase.steps);
  const completedSteps = allSteps.filter(step => step.status === 'completed').length;

  const incompleteSteps = getIncompleteSteps(progress);
  const nextSteps = incompleteSteps.slice(0, 3).map(step => step.stepId);

  return {
    overallCompletion: calculateOverallProgress(progress),
    completedPhases,
    totalSteps: allSteps.length,
    completedSteps,
    currentPhase: progress.currentPhase,
    nextSteps
  };
}

// Type Guards

/**
 * Type guard to check if data is UserProgress
 */
export function isUserProgress(data: any): data is UserProgress {
  return validateUserProgress(data).isValid;
}

/**
 * Type guard to check if data is ProjectData
 */
export function isProjectData(data: any): data is ProjectData {
  return validateProjectData(data).isValid;
}

/**
 * Type guard to check if data is Framework
 */
export function isFramework(data: any): data is Framework {
  return validateFramework(data).isValid;
}
