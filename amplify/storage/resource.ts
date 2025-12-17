import { defineStorage } from '@aws-amplify/backend';
import { mediaProcessor } from '../function/mediaProcessor/resource';

/**
 * STORAGE CONFIGURATION
 *
 * ⚠️ SECURITY NOTE: Guest write access is enabled for development.
 * Before production, remove all guest.to(['write']) permissions!
 */
export const storage = defineStorage({
  name: 'syncOpsDrive',
  access: (allow) => ({
    // Media files - AI processing triggered on upload
    'media/{entity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read']), // For share links
    ],
    // Project assets
    'projects/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read']), // For external review links
    ],
    // Moodboard references (images, videos for creative inspiration)
    'moodboard/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read']), // For external sharing
    ],
    // Public assets (thumbnails, exports)
    'public/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      // TODO: Remove guest write before production
      allow.guest.to(['read', 'write']),
    ],
    // Legal/rights documents
    'rights-documents/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      // TODO: Remove guest write before production
      allow.guest.to(['read', 'write']),
    ],
  }),
  triggers: {
    onUpload: mediaProcessor,
  },
});