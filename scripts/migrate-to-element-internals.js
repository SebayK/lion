#!/usr/bin/env node

/**
 * Skrypt do automatycznej migracji komponentów na Element Internals
 *
 * Użycie:
 *   node scripts/migrate-to-element-internals.js input
 *   node scripts/migrate-to-element-internals.js --all
 *   node scripts/migrate-to-element-internals.js --help
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.join(__dirname, '../packages/ui/components');

const COMPONENTS = [
  'input',
  'textarea',
  'select',
  'checkbox-group',
  'radio-group',
  'fieldset',
  'form',
  'input-email',
  'input-date',
  'input-amount',
  'input-iban',
  'input-range',
  'input-stepper',
  'input-tel',
  'input-datepicker',
  'input-file',
  'input-amount-dropdown',
  'input-tel-dropdown',
];

function migrateComponent(componentName, options = {}) {
  const { dryRun = false } = options;
  const componentDir = path.join(componentsDir, componentName);
  const srcDir = path.join(componentDir, 'src');

  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️  Skipping ${componentName} - no src directory`);
    return { success: false, reason: 'no-src' };
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
  let changed = false;
  const changedFiles = [];

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Zamień import
    content = content.replace(
      /from ['"]@lion\/ui\/form-core\.js['"]/g,
      `from '@lion/ui/form-core-element-internals.js'`,
    );

    if (content !== originalContent) {
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }
      console.log(`  ${dryRun ? '📝' : '✓'} ${file}`);
      changedFiles.push(file);
      changed = true;
    }
  }

  if (changed) {
    console.log(
      `${dryRun ? '📋' : '✅'} ${dryRun ? 'Would migrate' : 'Migrated'} ${componentName}`,
    );
    return { success: true, changedFiles };
  }
  console.log(`⏭️  No changes needed for ${componentName}`);
  return { success: true, noChanges: true };
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log('Usage:');
    console.log('  node scripts/migrate-to-element-internals.js <component>');
    console.log('  node scripts/migrate-to-element-internals.js --all');
    console.log('  node scripts/migrate-to-element-internals.js --all --dry-run');
    console.log('\nExample:');
    console.log('  node scripts/migrate-to-element-internals.js input');
    console.log('\nAvailable components:');
    COMPONENTS.forEach(comp => console.log(`  - ${comp}`));
    return;
  }

  const dryRun = args.includes('--dry-run');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - no files will be modified\n');
  }

  if (args.includes('--all')) {
    console.log('🚀 Migrating all components to Element Internals...\n');

    const results = COMPONENTS.map(comp => ({
      component: comp,
      ...migrateComponent(comp, { dryRun }),
    }));

    console.log('\n📊 Summary:');
    console.log(`Total: ${results.length}`);
    console.log(`Migrated: ${results.filter(r => r.success && !r.noChanges).length}`);
    console.log(`No changes: ${results.filter(r => r.noChanges).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
  } else if (args.length > 0 && !args[0].startsWith('--')) {
    const component = args[0];
    if (!COMPONENTS.includes(component)) {
      console.error(`❌ Unknown component: ${component}`);
      console.log('\nAvailable components:');
      COMPONENTS.forEach(comp => console.log(`  - ${comp}`));
      process.exit(1);
    }

    console.log(`🚀 Migrating ${component} to Element Internals...\n`);
    migrateComponent(component, { dryRun });
  } else {
    console.log('Usage:');
    console.log('  node scripts/migrate-to-element-internals.js <component>');
    console.log('  node scripts/migrate-to-element-internals.js --all');
    console.log('  node scripts/migrate-to-element-internals.js --help');
    console.log('\nExample:');
    console.log('  node scripts/migrate-to-element-internals.js input');
  }
}

main();
