#!/usr/bin/env node

/**
 * Skrypt do sprawdzania statusu migracji komponentów na Element Internals
 * 
 * Użycie:
 *   node scripts/check-migration-status.js
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

function checkComponent(name) {
  const srcDir = path.join(componentsDir, name, 'src');
  if (!fs.existsSync(srcDir)) {
    return { migrated: null, files: [] };
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
  let oldImports = 0;
  let newImports = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
    if (content.includes('@lion/ui/form-core.js')) oldImports += 1;
    if (content.includes('@lion/ui/form-core-element-internals.js')) newImports += 1;
  }

  return {
    migrated: oldImports === 0 && newImports > 0,
    oldImports,
    newImports,
    files: files.length,
  };
}

console.log('📊 Element Internals Migration Status\n');
console.log('Component                  Status      Files  Old  New');
console.log('─'.repeat(60));

let totalMigrated = 0;
const statusDetails = [];

for (const comp of COMPONENTS) {
  const status = checkComponent(comp);
  let statusIcon = '⚪';
  if (status.migrated === true) {
    statusIcon = '✅';
  } else if (status.migrated === false) {
    statusIcon = '❌';
  }
  const name = comp.padEnd(25);

  console.log(
    `${name} ${statusIcon}      ${status.files || '-'}     ${status.oldImports || '-'}    ${status.newImports || '-'}`,
  );

  if (status.migrated) totalMigrated += 1;

  statusDetails.push({
    component: comp,
    ...status,
  });
}

console.log('─'.repeat(60));
console.log(`\nProgress: ${totalMigrated}/${COMPONENTS.length} components migrated`);
console.log(`Percentage: ${Math.round((totalMigrated / COMPONENTS.length) * 100)}%`);

const notMigrated = statusDetails.filter(s => s.migrated === false);
if (notMigrated.length > 0) {
  console.log('\n🔴 Components still using old form-core:');
  notMigrated.forEach(s => console.log(`  - ${s.component} (${s.oldImports} imports)`));
}

const migrated = statusDetails.filter(s => s.migrated === true);
if (migrated.length > 0) {
  console.log('\n✅ Successfully migrated components:');
  migrated.forEach(s => console.log(`  - ${s.component}`));
}

console.log('\n📈 Next steps:');
if (totalMigrated === 0) {
  console.log('  1. Start with Phase 1: Migrate LionInput (proof of concept)');
  console.log('  2. Run: node scripts/migrate-to-element-internals.js input');
} else if (totalMigrated < COMPONENTS.length) {
  console.log(`  1. Continue migration of remaining ${COMPONENTS.length - totalMigrated} components`);
  console.log('  2. Run tests for each migrated component');
} else {
  console.log('  🎉 All components migrated!');
  console.log('  1. Run full test suite: npm test');
  console.log('  2. Update documentation');
  console.log('  3. Prepare for Phase 6: Verification');
}
