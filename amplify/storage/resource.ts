import { defineStorage } from '@aws-amplify/backend';
import { mediaProcessor } from '../function/mediaProcessor/resource';

export const storage = defineStorage({
  name: 'syncOpsDrive',
  access: (allow) => ({
    'media/{entity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read']), // For share links later
    ],
    'projects/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read']), // TEMPORARY: For development without Cognito
    ],
    'public/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read', 'write']), // TEMPORARY: For development without Cognito
    ],
  }),
  triggers: {
    onUpload: mediaProcessor,
  },
});