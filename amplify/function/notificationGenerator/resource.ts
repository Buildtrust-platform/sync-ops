import { defineFunction } from '@aws-amplify/backend';

export const notificationGenerator = defineFunction({
  name: 'notificationGenerator',
  entry: './handler.ts',
  timeoutSeconds: 30,
  resourceGroupName: 'data', // Assign to data stack to avoid circular dependency
  environment: {
    // Environment variables will be set by backend.ts
  },
});
