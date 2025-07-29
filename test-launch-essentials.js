// Simple test to verify our types and utilities work
const {
  createDefaultUserProgress,
  createDefaultProjectData,
  calculateOverallProgress,
  validateUserProgress
} = require('./lib/launch-essentials-utils.ts');

// Test creating default user progress
try {
  const userProgress = createDefaultUserProgress('user123', 'project456');
  console.log('✅ createDefaultUserProgress works');
  console.log('Current phase:', userProgress.currentPhase);
  console.log('Number of phases:', Object.keys(userProgress.phases).length);

  // Test progress calculation
  const overallProgress = calculateOverallProgress(userProgress);
  console.log('✅ calculateOverallProgress works, progress:', overallProgress);

  // Test creating default project data
  const projectData = createDefaultProjectData('user123', 'Test Project', 'A test project');
  console.log('✅ createDefaultProjectData works');
  console.log('Project name:', projectData.name);
  console.log('Project stage:', projectData.stage);

} catch (error) {
  console.error('❌ Error:', error.message);
}
