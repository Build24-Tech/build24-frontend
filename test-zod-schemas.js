// Test Zod schemas
const { z } = require('zod');

// Test basic schema validation
const LaunchPhaseSchema = z.enum([
  'validation',
  'definition',
  'technical',
  'marketing',
  'operations',
  'financial',
  'risk',
  'optimization'
]);

const StepStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'skipped'
]);

try {
  // Test valid data
  const validPhase = LaunchPhaseSchema.parse('validation');
  console.log('✅ LaunchPhaseSchema validation works:', validPhase);

  const validStatus = StepStatusSchema.parse('completed');
  console.log('✅ StepStatusSchema validation works:', validStatus);

  // Test invalid data
  try {
    LaunchPhaseSchema.parse('invalid_phase');
  } catch (error) {
    console.log('✅ LaunchPhaseSchema correctly rejects invalid data');
  }

  console.log('✅ All Zod schema tests passed');

} catch (error) {
  console.error('❌ Zod schema error:', error.message);
}
