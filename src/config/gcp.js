export const ORCHESTATOR_PROJECT_ID = 'df-demo-project-orchestator';
export const ORCHESTATOR_BUCKET_URI = 'gs://df-demo-ci-cd';
export const ENVIRONMENTS_CONFIGURATION = new Map([
  ['dev', {
    agentId: 'df-demo-project-dev-csgu',
    agentLocation: 'global',
    prefixBackupName: 'dev',
  }],
  ['test', {
    agentId: 'df-demo-project-test-tbdq',
    agentLocation: 'global',
    prefixBackupName: 'test',
  }],
  ['prod', {
    agentId: 'df-demo-project-prod',
    agentLocation: 'global',
    prefixBackupName: 'prod',
  }],
]);
