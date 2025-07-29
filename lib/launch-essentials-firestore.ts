import {
  Framework,
  LaunchPhase,
  PhaseProgress,
  ProjectData,
  StepProgress,
  StepStatus,
  Template,
  UserProgress
} from '@/types/launch-essentials';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
const COLLECTIONS = {
  USER_PROGRESS: 'launch_essentials_progress',
  PROJECTS: 'launch_essentials_projects',
  FRAMEWORKS: 'launch_essentials_frameworks',
  TEMPLATES: 'launch_essentials_templates'
} as const;

// User Progress Operations
export class UserProgressService {
  /**
   * Creates a new user progress record
   */
  static async createUserProgress(
    userId: string,
    projectId: string,
    initialPhase: LaunchPhase = 'validation'
  ): Promise<UserProgress> {
    try {
      const progressId = `${userId}_${projectId}`;
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);

      const now = new Date();
      const initialProgress: UserProgress = {
        userId,
        projectId,
        currentPhase: initialPhase,
        phases: {} as Record<LaunchPhase, PhaseProgress>,
        createdAt: now,
        updatedAt: now
      };

      // Initialize all phases with empty progress
      const phases: LaunchPhase[] = [
        'validation', 'definition', 'technical', 'marketing',
        'operations', 'financial', 'risk', 'optimization'
      ];

      phases.forEach(phase => {
        initialProgress.phases[phase] = {
          phase,
          steps: [],
          completionPercentage: 0,
          startedAt: now
        };
      });

      await setDoc(progressRef, {
        ...initialProgress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return initialProgress;
    } catch (error) {
      console.error('Error creating user progress:', error);
      throw new Error(`Failed to create user progress: ${error}`);
    }
  }

  /**
   * Gets user progress for a specific project
   */
  static async getUserProgress(userId: string, projectId: string): Promise<UserProgress | null> {
    try {
      const progressId = `${userId}_${projectId}`;
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate()
        } as UserProgress;
      }

      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw new Error(`Failed to get user progress: ${error}`);
    }
  }

  /**
   * Updates step progress within a phase
   */
  static async updateStepProgress(
    userId: string,
    projectId: string,
    phase: LaunchPhase,
    stepId: string,
    status: StepStatus,
    data?: any,
    notes?: string
  ): Promise<void> {
    try {
      const progressId = `${userId}_${projectId}`;
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);

      const progressSnap = await getDoc(progressRef);
      if (!progressSnap.exists()) {
        throw new Error('User progress not found');
      }

      const currentProgress = progressSnap.data() as UserProgress;
      const phaseProgress = currentProgress.phases[phase];

      if (!phaseProgress) {
        throw new Error(`Phase ${phase} not found in user progress`);
      }

      // Update or add step progress
      const existingStepIndex = phaseProgress.steps.findIndex(step => step.stepId === stepId);
      const stepProgress: StepProgress = {
        stepId,
        status,
        data: data || {},
        completedAt: status === 'completed' ? new Date() : undefined,
        notes
      };

      if (existingStepIndex >= 0) {
        phaseProgress.steps[existingStepIndex] = stepProgress;
      } else {
        phaseProgress.steps.push(stepProgress);
      }

      // Recalculate phase completion percentage
      const completedSteps = phaseProgress.steps.filter(step => step.status === 'completed').length;
      const totalSteps = phaseProgress.steps.length;
      phaseProgress.completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      // Mark phase as completed if all steps are done
      if (phaseProgress.completionPercentage === 100 && !phaseProgress.completedAt) {
        phaseProgress.completedAt = new Date();
      }

      // Update the document
      await updateDoc(progressRef, {
        [`phases.${phase}`]: phaseProgress,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating step progress:', error);
      throw new Error(`Failed to update step progress: ${error}`);
    }
  }

  /**
   * Updates current phase
   */
  static async updateCurrentPhase(
    userId: string,
    projectId: string,
    newPhase: LaunchPhase
  ): Promise<void> {
    try {
      const progressId = `${userId}_${projectId}`;
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);

      await updateDoc(progressRef, {
        currentPhase: newPhase,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating current phase:', error);
      throw new Error(`Failed to update current phase: ${error}`);
    }
  }

  /**
   * Gets all user progress records for a user
   */
  static async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const progressQuery = query(
        collection(db, COLLECTIONS.USER_PROGRESS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(progressQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate()
        } as UserProgress;
      });

    } catch (error) {
      console.error('Error getting all user progress:', error);
      throw new Error(`Failed to get all user progress: ${error}`);
    }
  }

  /**
   * Subscribes to real-time updates for user progress
   */
  static subscribeToUserProgress(
    userId: string,
    projectId: string,
    callback: (progress: UserProgress | null) => void
  ): Unsubscribe {
    const progressId = `${userId}_${projectId}`;
    const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);

    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const progress: UserProgress = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate()
        } as UserProgress;
        callback(progress);
      } else {
        callback(null);
      }
    });
  }
}

// Project Data Operations
export class ProjectDataService {
  /**
   * Creates a new project
   */
  static async createProject(projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectData> {
    try {
      const projectsRef = collection(db, COLLECTIONS.PROJECTS);
      const now = new Date();

      const newProject: Omit<ProjectData, 'id'> = {
        ...projectData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(projectsRef, {
        ...newProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        ...newProject,
        id: docRef.id
      };

    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error}`);
    }
  }

  /**
   * Gets a project by ID
   */
  static async getProject(projectId: string): Promise<ProjectData | null> {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const data = projectSnap.data();
        return {
          ...data,
          id: projectSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProjectData;
      }

      return null;
    } catch (error) {
      console.error('Error getting project:', error);
      throw new Error(`Failed to get project: ${error}`);
    }
  }

  /**
   * Updates project data
   */
  static async updateProject(
    projectId: string,
    updates: Partial<Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);

      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error}`);
    }
  }

  /**
   * Updates specific phase data within a project
   */
  static async updateProjectPhaseData(
    projectId: string,
    phase: LaunchPhase,
    phaseData: any
  ): Promise<void> {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);

      await updateDoc(projectRef, {
        [`data.${phase}`]: phaseData,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating project phase data:', error);
      throw new Error(`Failed to update project phase data: ${error}`);
    }
  }

  /**
   * Gets all projects for a user
   */
  static async getUserProjects(userId: string): Promise<ProjectData[]> {
    try {
      const projectsQuery = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(projectsQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProjectData;
      });

    } catch (error) {
      console.error('Error getting user projects:', error);
      throw new Error(`Failed to get user projects: ${error}`);
    }
  }

  /**
   * Deletes a project
   */
  static async deleteProject(projectId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete project
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      batch.delete(projectRef);

      // Delete associated progress records
      const progressQuery = query(
        collection(db, COLLECTIONS.USER_PROGRESS),
        where('projectId', '==', projectId)
      );

      const progressSnapshot = await getDocs(progressQuery);
      progressSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error}`);
    }
  }

  /**
   * Subscribes to real-time updates for a project
   */
  static subscribeToProject(
    projectId: string,
    callback: (project: ProjectData | null) => void
  ): Unsubscribe {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);

    return onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const project: ProjectData = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProjectData;
        callback(project);
      } else {
        callback(null);
      }
    });
  }
}

// Framework Operations
export class FrameworkService {
  /**
   * Gets all frameworks
   */
  static async getAllFrameworks(): Promise<Framework[]> {
    try {
      const frameworksQuery = query(
        collection(db, COLLECTIONS.FRAMEWORKS),
        orderBy('phase')
      );

      const querySnapshot = await getDocs(frameworksQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Framework));

    } catch (error) {
      console.error('Error getting frameworks:', error);
      throw new Error(`Failed to get frameworks: ${error}`);
    }
  }

  /**
   * Gets frameworks for a specific phase
   */
  static async getFrameworksByPhase(phase: LaunchPhase): Promise<Framework[]> {
    try {
      const frameworksQuery = query(
        collection(db, COLLECTIONS.FRAMEWORKS),
        where('phase', '==', phase)
      );

      const querySnapshot = await getDocs(frameworksQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Framework));

    } catch (error) {
      console.error('Error getting frameworks by phase:', error);
      throw new Error(`Failed to get frameworks by phase: ${error}`);
    }
  }

  /**
   * Gets a specific framework by ID
   */
  static async getFramework(frameworkId: string): Promise<Framework | null> {
    try {
      const frameworkRef = doc(db, COLLECTIONS.FRAMEWORKS, frameworkId);
      const frameworkSnap = await getDoc(frameworkRef);

      if (frameworkSnap.exists()) {
        return {
          ...frameworkSnap.data(),
          id: frameworkSnap.id
        } as Framework;
      }

      return null;
    } catch (error) {
      console.error('Error getting framework:', error);
      throw new Error(`Failed to get framework: ${error}`);
    }
  }

  /**
   * Creates a new framework (admin function)
   */
  static async createFramework(framework: Omit<Framework, 'id'>): Promise<Framework> {
    try {
      const frameworksRef = collection(db, COLLECTIONS.FRAMEWORKS);
      const docRef = await addDoc(frameworksRef, framework);

      return {
        ...framework,
        id: docRef.id
      };

    } catch (error) {
      console.error('Error creating framework:', error);
      throw new Error(`Failed to create framework: ${error}`);
    }
  }

  /**
   * Updates a framework (admin function)
   */
  static async updateFramework(
    frameworkId: string,
    updates: Partial<Omit<Framework, 'id'>>
  ): Promise<void> {
    try {
      const frameworkRef = doc(db, COLLECTIONS.FRAMEWORKS, frameworkId);
      await updateDoc(frameworkRef, updates);

    } catch (error) {
      console.error('Error updating framework:', error);
      throw new Error(`Failed to update framework: ${error}`);
    }
  }
}

// Template Operations
export class TemplateService {
  /**
   * Gets all templates
   */
  static async getAllTemplates(): Promise<Template[]> {
    try {
      const templatesQuery = query(
        collection(db, COLLECTIONS.TEMPLATES),
        orderBy('category'),
        orderBy('name')
      );

      const querySnapshot = await getDocs(templatesQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Template;
      });

    } catch (error) {
      console.error('Error getting templates:', error);
      throw new Error(`Failed to get templates: ${error}`);
    }
  }

  /**
   * Gets templates by category
   */
  static async getTemplatesByCategory(category: string): Promise<Template[]> {
    try {
      const templatesQuery = query(
        collection(db, COLLECTIONS.TEMPLATES),
        where('category', '==', category),
        orderBy('name')
      );

      const querySnapshot = await getDocs(templatesQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Template;
      });

    } catch (error) {
      console.error('Error getting templates by category:', error);
      throw new Error(`Failed to get templates by category: ${error}`);
    }
  }

  /**
   * Gets a specific template by ID
   */
  static async getTemplate(templateId: string): Promise<Template | null> {
    try {
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, templateId);
      const templateSnap = await getDoc(templateRef);

      if (templateSnap.exists()) {
        const data = templateSnap.data();
        return {
          ...data,
          id: templateSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Template;
      }

      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      throw new Error(`Failed to get template: ${error}`);
    }
  }

  /**
   * Creates a new template (admin function)
   */
  static async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    try {
      const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
      const now = new Date();

      const newTemplate = {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(templatesRef, newTemplate);

      return {
        ...template,
        id: docRef.id,
        createdAt: now,
        updatedAt: now
      };

    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error(`Failed to create template: ${error}`);
    }
  }

  /**
   * Updates a template (admin function)
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, templateId);

      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error(`Failed to update template: ${error}`);
    }
  }

  /**
   * Deletes a template (admin function)
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, templateId);
      await deleteDoc(templateRef);

    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error(`Failed to delete template: ${error}`);
    }
  }
}

// Utility Functions
export class LaunchEssentialsUtils {
  /**
   * Calculates overall progress across all phases
   */
  static calculateOverallProgress(userProgress: UserProgress): number {
    const phases = Object.values(userProgress.phases);
    if (phases.length === 0) return 0;

    const totalCompletion = phases.reduce((sum, phase) => sum + phase.completionPercentage, 0);
    return Math.round(totalCompletion / phases.length);
  }

  /**
   * Gets the next recommended phase based on current progress
   */
  static getNextRecommendedPhase(userProgress: UserProgress): LaunchPhase | null {
    const phaseOrder: LaunchPhase[] = [
      'validation', 'definition', 'technical', 'marketing',
      'operations', 'financial', 'risk', 'optimization'
    ];

    const currentPhaseIndex = phaseOrder.indexOf(userProgress.currentPhase);

    // Check if current phase is completed
    const currentPhaseProgress = userProgress.phases[userProgress.currentPhase];
    if (currentPhaseProgress.completionPercentage === 100) {
      // Return next phase if available
      if (currentPhaseIndex < phaseOrder.length - 1) {
        return phaseOrder[currentPhaseIndex + 1];
      }
    }

    // Return current phase if not completed, or null if all phases are done
    return currentPhaseProgress.completionPercentage < 100 ? userProgress.currentPhase : null;
  }

  /**
   * Validates project data structure
   */
  static validateProjectData(projectData: Partial<ProjectData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!projectData.name || projectData.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (!projectData.description || projectData.description.trim().length === 0) {
      errors.push('Project description is required');
    }

    if (!projectData.industry || projectData.industry.trim().length === 0) {
      errors.push('Industry is required');
    }

    if (!projectData.targetMarket || projectData.targetMarket.trim().length === 0) {
      errors.push('Target market is required');
    }

    if (!projectData.stage) {
      errors.push('Project stage is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates a project summary based on current data
   */
  static generateProjectSummary(project: ProjectData, progress: UserProgress): {
    completionPercentage: number;
    completedPhases: LaunchPhase[];
    currentPhase: LaunchPhase;
    nextSteps: string[];
  } {
    const completionPercentage = this.calculateOverallProgress(progress);
    const completedPhases = Object.entries(progress.phases)
      .filter(([_, phaseProgress]) => phaseProgress.completionPercentage === 100)
      .map(([phase, _]) => phase as LaunchPhase);

    const nextSteps: string[] = [];
    const currentPhaseProgress = progress.phases[progress.currentPhase];

    // Get incomplete steps from current phase
    const incompleteSteps = currentPhaseProgress.steps
      .filter(step => step.status !== 'completed')
      .slice(0, 3); // Limit to 3 next steps

    incompleteSteps.forEach(step => {
      nextSteps.push(`Complete step: ${step.stepId}`);
    });

    return {
      completionPercentage,
      completedPhases,
      currentPhase: progress.currentPhase,
      nextSteps
    };
  }
}
