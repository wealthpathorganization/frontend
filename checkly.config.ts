import { defineConfig } from 'checkly';
import { Frequency } from 'checkly/constructs';

/**
 * Checkly configuration for WealthPath E2E and API monitoring
 * See: https://www.checklyhq.com/docs/cli/
 */
export default defineConfig({
  projectName: 'WealthPath',
  logicalId: 'wealthpath-monitoring',
  repoUrl: 'https://github.com/wealthpath/wealthpath',
  checks: {
    // Check files location
    locations: ['us-east-1', 'eu-west-1'],
    // Tags for organizing checks
    tags: ['wealthpath', 'finance'],
    // Default runtime for browser checks
    runtimeId: '2024.02',
    // Default frequency for checks
    frequency: Frequency.EVERY_10M,
    // Environment variables available to all checks
    environmentVariables: [],
    // Browser checks configuration
    browserChecks: {
      testMatch: '**/__checks__/*.check.ts',
    },
  },
  cli: {
    runLocation: 'us-east-1',
    reporters: ['list'],
  },
});
