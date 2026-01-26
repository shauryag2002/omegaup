#!/usr/bin/env node
/**
 * Script to remap Docker paths in coverage data to local paths
 * This fixes the issue where coverage data contains /opt/omegaup/ paths
 * that need to be mapped to local workspace paths for report generation
 */

const fs = require('fs');
const path = require('path');

// Get workspace root (parent of scripts directory)
const workspaceRoot = path.resolve(__dirname, '..');
const coverageFile = path.join(workspaceRoot, 'coverage', 'coverage-final.json');

if (!fs.existsSync(coverageFile)) {
  console.error(`Coverage file not found: ${coverageFile}`);
  process.exit(1);
}

console.log('Reading coverage data...');
const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

console.log('Remapping Docker paths to local paths...');
let remappedCount = 0;

// Create a new object with remapped keys
const remappedData = {};
for (const [filePath, coverage] of Object.entries(coverageData)) {
  let newPath = filePath;
  
  // Replace Docker paths with local workspace paths
  if (filePath.startsWith('/opt/omegaup/')) {
    newPath = filePath.replace('/opt/omegaup/', workspaceRoot + '/');
    remappedCount++;
  }
  
  // Also check if the path object itself has path properties that need remapping
  if (coverage && typeof coverage === 'object') {
    const remappedCoverage = { ...coverage };
    
    // Remap path property if it exists
    if (remappedCoverage.path && remappedCoverage.path.startsWith('/opt/omegaup/')) {
      remappedCoverage.path = remappedCoverage.path.replace('/opt/omegaup/', workspaceRoot + '/');
    }
    
    remappedData[newPath] = remappedCoverage;
  } else {
    remappedData[newPath] = coverage;
  }
}

console.log(`Remapped ${remappedCount} file paths`);

// Write the remapped coverage data back
console.log('Writing remapped coverage data...');
fs.writeFileSync(coverageFile, JSON.stringify(remappedData, null, 2), 'utf8');

console.log('Done! Coverage paths have been remapped.');
