import { defineFunction } from '@aws-amplify/backend';

export const universalSearch = defineFunction({
  name: 'universal-search',
  entry: './handler.ts',
  timeoutSeconds: 30,
  runtime: 20,
  resourceGroupName: 'data',  // Assign to data stack to avoid circular dependency
  environment: {
    PROJECT_TABLE_NAME: '',
    ASSET_TABLE_NAME: '',
    REVIEWCOMMENT_TABLE_NAME: '',
    MESSAGE_TABLE_NAME: '',
    TASK_TABLE_NAME: '',
  },
});
