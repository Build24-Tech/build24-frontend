# Launch Essentials Firebase Implementation

This document describes the Firebase data layer implementation for the Launch Essentials feature.

## Overview

The Firebase implementation provides a complete data layer for managing user progress, project data, frameworks, and templates. It includes:

- **User Progress Tracking**: Real-time progress tracking across all launch phases
- **Project Management**: CRUD operations for project data with phase-specific information
- **Framework Management**: Read-only access to structured frameworks for each phase
- **Template System**: Reusable templates for various launch activities
- **Security Rules**: Comprehensive security rules ensuring data privacy and integrity

## Collections Structure

### 1. `launch_essentials_progress`
Stores user progress across all launch phases.

**Document ID Format**: `{userId}_{projectId}`

```typescript
interface UserProgress {
  userId: string;
  projectId: string;
  currentPhase: LaunchPhase;
  phases: Record<LaunchPhase, PhaseProgress>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### 2. `launch_essentials_projects`
Stores project information and phase-specific data.

```typescript
interface ProjectData {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  targetMarket: string;
  stage: ProjectStage;
  data: {
    validation?: ValidationData;
    definition?: ProductDefinitionData;
    // ... other phase data
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. `launch_essentials_frameworks`
Contains framework definitions for each launch phase (read-only for users).

```typescript
interface Framework {
  id: string;
  name: string;
  description: string;
  phase: LaunchPhase;
  steps: FrameworkStep[];
  templates: Template[];
  resources: Resource[];
}
```

### 4. `launch_essentials_templates`
Stores reusable templates for various activities (read-only for users).

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: TemplateVariable[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Service Classes

### UserProgressService

Manages user progress tracking across all phases.

```typescript
// Create new progress record
await UserProgressService.createUserProgress(userId, projectId, 'validation');

// Update step progress
await UserProgressService.updateStepProgress(
  userId, 
  projectId, 
  'validation', 
  'market-research', 
  'completed',
  { marketSize: 1000000 },
  'Completed market research analysis'
);

// Get current progress
const progress = await UserProgressService.getUserProgress(userId, projectId);

// Subscribe to real-time updates
const unsubscribe = UserProgressService.subscribeToUserProgress(
  userId, 
  projectId, 
  (progress) => {
    console.log('Progress updated:', progress);
  }
);
```

### ProjectDataService

Handles project CRUD operations and phase data management.

```typescript
// Create new project
const project = await ProjectDataService.createProject({
  userId: 'user123',
  name: 'My Startup',
  description: 'Revolutionary app idea',
  industry: 'Technology',
  targetMarket: 'Developers',
  stage: 'concept',
  data: {}
});

// Update project phase data
await ProjectDataService.updateProjectPhaseData(
  projectId,
  'validation',
  {
    marketResearch: { marketSize: 1000000, growthRate: 15 },
    competitorAnalysis: { competitors: [...] }
  }
);

// Get user's projects
const projects = await ProjectDataService.getUserProjects(userId);
```

### FrameworkService

Provides access to framework definitions.

```typescript
// Get all frameworks
const frameworks = await FrameworkService.getAllFrameworks();

// Get frameworks for specific phase
const validationFrameworks = await FrameworkService.getFrameworksByPhase('validation');

// Get specific framework
const framework = await FrameworkService.getFramework('product-validation-framework');
```

### TemplateService

Manages template operations.

```typescript
// Get all templates
const templates = await TemplateService.getAllTemplates();

// Get templates by category
const validationTemplates = await TemplateService.getTemplatesByCategory('validation');

// Get specific template
const template = await TemplateService.getTemplate('user-persona-template');
```

## Security Rules

The implementation includes comprehensive Firestore security rules:

### User Progress Rules
- Users can only access their own progress records
- Progress ID must match `{userId}_{projectId}` pattern
- Validates required fields on write operations

### Project Rules
- Users can only access projects they created
- Validates required project fields
- Ensures proper ownership

### Framework & Template Rules
- Read-only access for all authenticated users
- Write access restricted to admins (implement admin role as needed)

## Setup Instructions

### 1. Install Dependencies

```bash
yarn add firebase
yarn add -D @types/jest jest ts-jest
```

### 2. Environment Configuration

Add Firebase configuration to your `.env.local`:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 3. Update Firestore Security Rules

Copy the rules from `firebase-rules/firestore-security-rules.js` to your Firebase console:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace existing rules with the provided security rules
3. Publish the rules

### 4. Initialize Sample Data

Run the setup script to populate frameworks and templates:

```bash
yarn ts-node scripts/setup-launch-essentials-data.ts
```

### 5. Run Tests

Execute the test suite to verify implementation:

```bash
yarn test __tests__/launch-essentials-firestore.test.ts
```

## Usage Examples

### Creating a New Project with Progress Tracking

```typescript
import { UserProgressService, ProjectDataService } from '@/lib/launch-essentials-firestore';

async function createNewProject(userId: string, projectData: any) {
  // Create project
  const project = await ProjectDataService.createProject({
    userId,
    ...projectData
  });
  
  // Initialize progress tracking
  const progress = await UserProgressService.createUserProgress(
    userId,
    project.id,
    'validation'
  );
  
  return { project, progress };
}
```

### Updating Progress and Project Data

```typescript
async function completeValidationStep(
  userId: string,
  projectId: string,
  stepData: any
) {
  // Update step progress
  await UserProgressService.updateStepProgress(
    userId,
    projectId,
    'validation',
    'market-research',
    'completed',
    stepData
  );
  
  // Update project data
  await ProjectDataService.updateProjectPhaseData(
    projectId,
    'validation',
    { marketResearch: stepData }
  );
}
```

### Real-time Progress Monitoring

```typescript
function setupProgressMonitoring(userId: string, projectId: string) {
  return UserProgressService.subscribeToUserProgress(
    userId,
    projectId,
    (progress) => {
      if (progress) {
        const overallProgress = LaunchEssentialsUtils.calculateOverallProgress(progress);
        const nextPhase = LaunchEssentialsUtils.getNextRecommendedPhase(progress);
        
        console.log(`Overall progress: ${overallProgress}%`);
        console.log(`Next recommended phase: ${nextPhase}`);
      }
    }
  );
}
```

## Error Handling

All service methods include comprehensive error handling:

- **Network Errors**: Automatic retry logic for transient failures
- **Validation Errors**: Clear error messages for invalid data
- **Permission Errors**: Proper handling of unauthorized access
- **Data Integrity**: Validation of required fields and data structure

## Performance Considerations

- **Lazy Loading**: Load frameworks and templates on demand
- **Caching**: Implement client-side caching for frequently accessed data
- **Batch Operations**: Use batch writes for multiple related updates
- **Real-time Subscriptions**: Unsubscribe from listeners when components unmount

## Testing

The implementation includes comprehensive unit tests covering:

- All service methods and error scenarios
- Data validation and transformation utilities
- Real-time subscription setup and teardown
- Edge cases and error conditions

Run tests with:

```bash
yarn test __tests__/launch-essentials-firestore.test.ts
```

## Next Steps

1. **Implement Admin Interface**: Create admin tools for managing frameworks and templates
2. **Add Data Migration**: Implement data migration utilities for schema updates
3. **Performance Monitoring**: Add analytics and performance monitoring
4. **Backup Strategy**: Implement automated backup and recovery procedures
5. **Advanced Features**: Add features like data export, collaboration, and version history

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure security rules are properly configured
2. **Network Errors**: Check Firebase configuration and network connectivity
3. **Data Validation**: Verify data structure matches TypeScript interfaces
4. **Real-time Updates**: Ensure proper subscription cleanup to prevent memory leaks

### Debug Mode

Enable Firebase debug logging:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

// For development/testing
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Support

For issues or questions:

1. Check the test suite for usage examples
2. Review Firebase documentation for Firestore best practices
3. Ensure all dependencies are properly installed and configured
4. Verify environment variables are correctly set
