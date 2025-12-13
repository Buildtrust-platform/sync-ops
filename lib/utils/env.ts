/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup to catch
 * configuration errors early rather than at runtime.
 */

interface EnvConfig {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

/**
 * Environment variable configurations
 */
const envConfigs: EnvConfig[] = [
  // Stripe configuration (required for billing features)
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false, // Optional - billing features disabled if not set
    validator: (v) => v.startsWith('pk_'),
    errorMessage: 'Must start with "pk_"',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false, // Optional - billing features disabled if not set
    validator: (v) => v.startsWith('sk_'),
    errorMessage: 'Must start with "sk_"',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    validator: (v) => v.startsWith('whsec_'),
    errorMessage: 'Must start with "whsec_"',
  },
];

/**
 * Result of environment validation
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingOptional: string[];
}

/**
 * Validates environment variables against configured rules
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingOptional: string[] = [];

  for (const config of envConfigs) {
    const value = process.env[config.name];

    // Check if variable exists
    if (!value || value.trim() === '') {
      if (config.required) {
        errors.push(`Missing required environment variable: ${config.name}`);
      } else {
        missingOptional.push(config.name);
      }
      continue;
    }

    // Check if value is a placeholder
    if (value.includes('xxxxxxxxxxxxx') || value === 'your-value-here') {
      if (config.required) {
        errors.push(`Environment variable ${config.name} has placeholder value`);
      } else {
        warnings.push(`Environment variable ${config.name} appears to have a placeholder value`);
      }
      continue;
    }

    // Run custom validator if provided
    if (config.validator && !config.validator(value)) {
      const msg = config.errorMessage || 'Invalid value';
      if (config.required) {
        errors.push(`${config.name}: ${msg}`);
      } else {
        warnings.push(`${config.name}: ${msg}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingOptional,
  };
}

/**
 * Get a validated environment variable
 * Throws an error if the variable is required but not set
 */
export function getEnv(name: string, required = false): string | undefined {
  const value = process.env[name];

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Get an environment variable with a default value
 */
export function getEnvWithDefault(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : defaultValue;
}

/**
 * Check if an environment variable is set (not empty)
 */
export function hasEnv(name: string): boolean {
  const value = process.env[name];
  return Boolean(value && value.trim() !== '');
}

/**
 * Check if billing features are configured
 */
export function isBillingConfigured(): boolean {
  return (
    hasEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') &&
    hasEnv('STRIPE_SECRET_KEY')
  );
}

/**
 * Log validation results (for server startup)
 */
export function logEnvValidation(): void {
  const result = validateEnv();

  if (result.errors.length > 0) {
    console.error('\n❌ Environment Configuration Errors:');
    result.errors.forEach((err) => console.error(`   - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Configuration Warnings:');
    result.warnings.forEach((warn) => console.warn(`   - ${warn}`));
  }

  if (result.missingOptional.length > 0 && process.env.NODE_ENV === 'development') {
    console.info('\nℹ️  Optional environment variables not set:');
    result.missingOptional.forEach((name) => console.info(`   - ${name}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('\n✅ Environment configuration valid\n');
  } else if (result.valid) {
    console.log('\n✅ Environment configuration valid (with warnings)\n');
  } else {
    console.error('\n❌ Environment configuration invalid - please fix errors above\n');
  }
}

/**
 * Run validation at module load in development
 */
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run on server-side in development
  const result = validateEnv();
  if (!result.valid) {
    console.error('Environment validation failed:', result.errors);
  }
}
