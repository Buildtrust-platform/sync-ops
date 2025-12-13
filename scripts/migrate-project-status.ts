/**
 * MIGRATION SCRIPT: Update Project Status Values
 *
 * Migrates existing projects from old status values to new industry-standard values
 *
 * OLD → NEW:
 * INITIATION → DEVELOPMENT
 * PRE_PROD → PRE_PRODUCTION
 * POST → POST_PRODUCTION
 * LEGAL_REVIEW → LEGAL_COMPLIANCE
 * APPROVED → DISTRIBUTION (or LEGAL_COMPLIANCE depending on context)
 * ARCHIVED → ARCHIVE
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const STATUS_MIGRATION_MAP: Record<string, Schema["Project"]["type"]["status"]> = {
  'INITIATION': 'DEVELOPMENT',
  'PRE_PROD': 'PRE_PRODUCTION',
  'POST': 'POST_PRODUCTION',
  'LEGAL_REVIEW': 'LEGAL_COMPLIANCE',
  'APPROVED': 'DISTRIBUTION', // Assuming approved means ready for distribution
  'ARCHIVED': 'ARCHIVE',
};

async function migrateProjectStatuses() {
  console.log('🔄 Starting project status migration...\n');

  try {
    // Fetch all projects
    const { data: projects } = await client.models.Project.list();

    if (!projects || projects.length === 0) {
      console.log('✅ No projects found. Migration not needed.');
      return;
    }

    console.log(`Found ${projects.length} project(s) to check.\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const project of projects) {
      const oldStatus = project.status as string;
      const newStatus = STATUS_MIGRATION_MAP[oldStatus];

      if (newStatus && newStatus !== oldStatus) {
        try {
          console.log(`Migrating "${project.name}": ${oldStatus} → ${newStatus}`);

          await client.models.Project.update({
            id: project.id,
            status: newStatus,
          });

          // Log the migration
          await client.models.ActivityLog.create({
            organizationId: project.organizationId,
            projectId: project.id,
            userId: 'SYSTEM_MIGRATION',
            userEmail: 'system@syncops.app',
            action: 'PROJECT_UPDATED',
            targetType: 'Project',
            targetId: project.id,
            targetName: project.name || 'Unnamed Project',
            metadata: JSON.stringify({
              field: 'status',
              oldValue: oldStatus,
              newValue: newStatus,
              reason: 'Schema migration to industry-standard pipeline stages',
            }),
          });

          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrating project ${project.id}:`, error);
          errorCount++;
        }
      } else {
        console.log(`✓ "${project.name}": ${oldStatus} (already using new schema)`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (migratedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('Please refresh your browser to see the updated pipeline stages.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProjectStatuses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
