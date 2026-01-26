/// <reference types="cypress" />
// https://on.cypress.io/plugins-guide

const path = require('path');
const fs = require('fs');

/**
 * Remaps Docker paths in coverage data to local workspace paths
 */
function remapCoveragePaths(workspaceRoot) {
    const coverageFile = path.join(workspaceRoot, 'coverage', 'coverage-final.json');
    
    if (!fs.existsSync(coverageFile)) {
        return;
    }
    
    try {
        const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        const remappedData = {};
        let remappedCount = 0;
        
        for (const [filePath, coverage] of Object.entries(coverageData)) {
            let newPath = filePath;
            
            // Replace Docker paths with local workspace paths
            if (filePath.startsWith('/opt/omegaup/')) {
                newPath = filePath.replace('/opt/omegaup/', workspaceRoot + '/');
                remappedCount++;
            }
            
            // Also remap path property if it exists
            if (coverage && typeof coverage === 'object') {
                const remappedCoverage = { ...coverage };
                if (remappedCoverage.path && remappedCoverage.path.startsWith('/opt/omegaup/')) {
                    remappedCoverage.path = remappedCoverage.path.replace('/opt/omegaup/', workspaceRoot + '/');
                }
                remappedData[newPath] = remappedCoverage;
            } else {
                remappedData[newPath] = coverage;
            }
        }
        
        if (remappedCount > 0) {
            fs.writeFileSync(coverageFile, JSON.stringify(remappedData, null, 2), 'utf8');
            console.log(`[Coverage] Remapped ${remappedCount} Docker paths to local paths`);
        }
    } catch (error) {
        console.error('[Coverage] Error remapping paths:', error.message);
    }
}

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
    // Get the workspace root directory (go up from cypress/plugins to repo root)
    const workspaceRoot = path.resolve(__dirname, '../..');
    
    // Read the existing .nycrc config
    const nycrcPath = path.join(workspaceRoot, '.nycrc');
    const nycrc = JSON.parse(fs.readFileSync(nycrcPath, 'utf8'));
    
    // Update map-path to use absolute workspace root instead of relative path
    // This ensures Docker paths (/opt/omegaup/) are correctly mapped to local paths
    nycrc['map-path'] = [
        ['/opt/omegaup/', workspaceRoot + '/']
    ];
    
    // Set NYC_CONFIG environment variable so nyc uses our updated configuration
    process.env.NYC_CONFIG = JSON.stringify(nycrc);
    
    // Configure code coverage task
    require('@cypress/code-coverage/task')(on, config);
    
    // Hook into after:spec to remap paths after each spec completes
    // This ensures paths are remapped even if the test run is interrupted
    on('after:spec', (spec, results) => {
        remapCoveragePaths(workspaceRoot);
    });
    
    // Also remap paths when all tests complete
    on('task', {
        log(message) {
            console.log(message);
            return null;
        },
    });
    
    return config;
};
