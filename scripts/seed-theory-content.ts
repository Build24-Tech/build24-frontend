#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { contentManagementSystem } from '../lib/content-management';
import { theorySeedingSystem, theorySeeds } from '../lib/theory-seeding';

/**
 * Script to generate and write theory content files
 */
async function seedTheoryContent() {
  console.log('🌱 Starting theory content seeding...\n');

  // Ensure content directory exists
  const contentDir = path.join(process.cwd(), 'public', 'content', 'theories');

  try {
    await fs.access(contentDir);
  } catch {
    console.log('📁 Creating content directory...');
    await fs.mkdir(contentDir, { recursive: true });
  }

  // Generate and write each theory file
  const results = {
    success: [] as string[],
    errors: [] as string[],
    skipped: [] as string[]
  };

  for (const seed of theorySeeds) {
    const filePath = path.join(contentDir, `${seed.id}.md`);

    try {
      // Check if file already exists
      try {
        await fs.access(filePath);
        console.log(`⏭️  Skipping ${seed.id} (file already exists)`);
        results.skipped.push(seed.id);
        continue;
      } catch {
        // File doesn't exist, proceed with creation
      }

      // Generate content
      const content = contentManagementSystem.generateTheoryFromTemplate(seed);

      // Validate content
      const validation = contentManagementSystem.validateTheoryContent({
        ...seed,
        content
      });

      if (!validation.isValid) {
        console.log(`❌ Validation failed for ${seed.id}:`);
        validation.errors.forEach(error => console.log(`   - ${error}`));
        results.errors.push(`${seed.id}: ${validation.errors.join(', ')}`);
        continue;
      }

      // Write file
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Generated ${seed.id}.md`);
      results.success.push(seed.id);

      // Create version entry
      contentManagementSystem.createContentVersion(
        seed.id,
        content,
        'system',
        ['Initial content generation from seed data']
      );

    } catch (error) {
      console.log(`❌ Failed to generate ${seed.id}: ${error}`);
      results.errors.push(`${seed.id}: ${error}`);
    }
  }

  // Print summary
  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Successfully generated: ${results.success.length} files`);
  console.log(`⏭️  Skipped (already exist): ${results.skipped.length} files`);
  console.log(`❌ Errors: ${results.errors.length} files`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully generated:');
    results.success.forEach(id => console.log(`   - ${id}`));
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  Skipped files:');
    results.skipped.forEach(id => console.log(`   - ${id}`));
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }

  // Print statistics
  const stats = theorySeedingSystem.getTheoryStatistics();
  console.log('\n📈 Content Statistics:');
  console.log(`   Total theories: ${stats.total}`);
  console.log(`   Premium theories: ${stats.premiumCount}`);
  console.log(`   Average read time: ${stats.averageReadTime} minutes`);
  console.log('\n   By category:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`     ${category}: ${count} theories`);
  });
  console.log('\n   By difficulty:');
  Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`     ${difficulty}: ${count} theories`);
  });

  console.log('\n🎉 Theory content seeding completed!');
}

/**
 * Validate existing theory content
 */
async function validateExistingContent() {
  console.log('🔍 Validating existing theory content...\n');

  const contentDir = path.join(process.cwd(), 'public', 'content', 'theories');

  try {
    const files = await fs.readdir(contentDir);
    const theoryFiles = files.filter(file => file.endsWith('.md'));

    console.log(`Found ${theoryFiles.length} theory files to validate\n`);

    const results = {
      valid: [] as string[],
      invalid: [] as { file: string; errors: string[] }[]
    };

    for (const file of theoryFiles) {
      const filePath = path.join(contentDir, file);
      const theoryId = path.basename(file, '.md');

      try {
        const content = await fs.readFile(filePath, 'utf8');

        // Find corresponding seed data
        const seed = theorySeeds.find(s => s.id === theoryId);
        if (!seed) {
          console.log(`⚠️  No seed data found for ${theoryId}, skipping validation`);
          continue;
        }

        // Validate content
        const validation = contentManagementSystem.validateTheoryContent({
          ...seed,
          content
        });

        if (validation.isValid) {
          console.log(`✅ ${file} is valid`);
          results.valid.push(file);
        } else {
          console.log(`❌ ${file} has validation errors:`);
          validation.errors.forEach(error => console.log(`   - ${error}`));
          results.invalid.push({
            file,
            errors: validation.errors
          });
        }
      } catch (error) {
        console.log(`❌ Failed to validate ${file}: ${error}`);
        results.invalid.push({
          file,
          errors: [`Failed to read or parse file: ${error}`]
        });
      }
    }

    console.log('\n📊 Validation Summary:');
    console.log(`✅ Valid files: ${results.valid.length}`);
    console.log(`❌ Invalid files: ${results.invalid.length}`);

    if (results.invalid.length > 0) {
      console.log('\n❌ Files with validation errors:');
      results.invalid.forEach(({ file, errors }) => {
        console.log(`   ${file}:`);
        errors.forEach(error => console.log(`     - ${error}`));
      });
    }

  } catch (error) {
    console.log(`❌ Failed to validate content: ${error}`);
  }
}

/**
 * Update theory content versioning
 */
async function updateContentVersioning() {
  console.log('📝 Updating content versioning...\n');

  const contentDir = path.join(process.cwd(), 'public', 'content', 'theories');

  try {
    const files = await fs.readdir(contentDir);
    const theoryFiles = files.filter(file => file.endsWith('.md'));

    for (const file of theoryFiles) {
      const filePath = path.join(contentDir, file);
      const theoryId = path.basename(file, '.md');

      try {
        const content = await fs.readFile(filePath, 'utf8');

        // Create version entry if it doesn't exist
        const versions = contentManagementSystem.getVersionHistory(theoryId);
        if (versions.length === 0) {
          contentManagementSystem.createContentVersion(
            theoryId,
            content,
            'system',
            ['Initial version from existing content']
          );
          console.log(`📝 Created version entry for ${theoryId}`);
        }
      } catch (error) {
        console.log(`❌ Failed to process ${file}: ${error}`);
      }
    }

    console.log('\n✅ Content versioning updated!');
  } catch (error) {
    console.log(`❌ Failed to update versioning: ${error}`);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      await seedTheoryContent();
      break;
    case 'validate':
      await validateExistingContent();
      break;
    case 'version':
      await updateContentVersioning();
      break;
    default:
      console.log('Usage: npm run seed-theories [command]');
      console.log('Commands:');
      console.log('  seed     - Generate theory content files from seed data');
      console.log('  validate - Validate existing theory content files');
      console.log('  version  - Update content versioning for existing files');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { seedTheoryContent, updateContentVersioning, validateExistingContent };
