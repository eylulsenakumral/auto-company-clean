# Secrets Management

Secure handling of sensitive configuration and credentials.

## Secret Detection

### Common Secret Patterns

| Type | Regex Pattern | Example |
|------|---------------|---------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| AWS Secret Key | `[A-Za-z0-9/+***REMOVED***]{40}` | 40-char base64 string |
| GitHub Token | `ghp_[a-zA-Z0-9]{36}` | `ghp_xxxxxxxxxxxx...` |
| GitHub OAuth | `gho_[a-zA-Z0-9]{36}` | `gho_xxxxxxxxxxxx...` |
| Slack Token | `xox[baprs]-[0-9a-zA-Z]{10,}` | `xoxb-123456789-...` |
| Stripe Key | `sk_live_[0-9a-zA-Z]{24,}` | `sk_live_51H...` |
| Google API | `AIza[0-9A-Za-z-_]{35}` | `AIzaSyA...` |
| Private Key | `-----BEGIN.*PRIVATE KEY-----` | PEM format |
| Connection String | `(mongodb|postgres|mysql)://` | DB URLs |
| Generic API Key | `[aA]pi[_-]?[kK]ey.*['\"][a-zA-Z0-9]{16,}` | Various |

### Detection Tools

```bash
# Gitleaks - scan repository
gitleaks detect --source . --verbose
gitleaks detect --source . --report-format json --report-path leaks.json

# Git-secrets (AWS-focused)
git secrets --scan
git secrets --scan-history

# Trufflehog - deep history scan
trufflehog git file://. --json
trufflehog github --org***REMOVED***myorg --json

# Custom grep patterns
grep -rn "AKIA[0-9A-Z]{16}" --include***REMOVED***"*.ts" --include***REMOVED***"*.js" --include***REMOVED***"*.env*"
grep -rn "-----BEGIN.*PRIVATE KEY" --include***REMOVED***"*"
grep -rn "password\s****REMOVED***\s*['\"][^'\"]\+" --include***REMOVED***"*.ts"
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run gitleaks
if command -v gitleaks &> /dev/null; then
  gitleaks protect --staged --verbose
  if [ $? -ne 0 ]; then
    echo "Secrets detected! Commit blocked."
    exit 1
  fi
fi
```

---

## Environment Variables

### Secure .env Handling

```bash
# .env file structure
# Use descriptive names, never commit real values

# Database
DATABASE_URL***REMOVED***postgres://user:password@localhost:5432/myapp

# API Keys
STRIPE_SECRET_KEY***REMOVED***sk_test_...
SENDGRID_API_KEY***REMOVED***SG....

# JWT
JWT_SECRET***REMOVED***your-256-bit-secret-here
JWT_REFRESH_SECRET***REMOVED***your-other-256-bit-secret

# External Services  
AWS_ACCESS_KEY_ID***REMOVED***AKIA...
AWS_SECRET_ACCESS_KEY***REMOVED***...
```

### .gitignore Patterns

```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.development
.env.production

# Never commit these
*.pem
*.key
*.crt
*.p12
*.pfx

# IDE secrets
.idea/
.vscode/*.json

# Local config
config/local.json
secrets/
```

### Validation

```typescript
import { z } from 'zod';

// Define required environment variables
const envSchema ***REMOVED*** z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  AWS_ACCESS_KEY_ID: z.string().regex(/^AKIA[A-Z0-9]{16}$/),
  AWS_SECRET_ACCESS_KEY: z.string().length(40)
});

// Validate at startup
function validateEnv() {
  const result ***REMOVED*** envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment configuration:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

export const env ***REMOVED*** validateEnv();
```

---

## Secret Managers

### AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client ***REMOVED*** new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretId: string): Promise<Record<string, string>> {
  const command ***REMOVED*** new GetSecretValueCommand({ SecretId: secretId });
  const response ***REMOVED*** await client.send(command);
  
  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }
  
  throw new Error('Secret not found');
}

// Cache secrets
const secretCache ***REMOVED*** new Map<string, { value: unknown; expiry: number }>();
const CACHE_TTL ***REMOVED*** 5 * 60 * 1000; // 5 minutes

async function getCachedSecret(secretId: string) {
  const cached ***REMOVED*** secretCache.get(secretId);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }
  
  const value ***REMOVED*** await getSecret(secretId);
  secretCache.set(secretId, { value, expiry: Date.now() + CACHE_TTL });
  
  return value;
}
```

### HashiCorp Vault

```typescript
import Vault from 'node-vault';

const vault ***REMOVED*** Vault({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function getVaultSecret(path: string): Promise<Record<string, string>> {
  const result ***REMOVED*** await vault.read(path);
  return result.data.data;
}

// AppRole authentication
async function authenticateAppRole() {
  const result ***REMOVED*** await vault.approleLogin({
    role_id: process.env.VAULT_ROLE_ID,
    secret_id: process.env.VAULT_SECRET_ID
  });
  
  vault.token ***REMOVED*** result.auth.client_token;
}
```

### 1Password CLI

```bash
# Load secrets from 1Password
export DATABASE_URL***REMOVED***$(op read "op://Vault/Database/connection_string")
export JWT_SECRET***REMOVED***$(op read "op://Vault/JWT/secret")

# Or use op run
op run --env-file***REMOVED***.env -- npm start
```

---

## Kubernetes Secrets

### Creating Secrets

```bash
# From literal values
kubectl create secret generic app-secrets \
  --from-literal***REMOVED***database-url***REMOVED***'postgres://...' \
  --from-literal***REMOVED***jwt-secret***REMOVED***'...'

# From file
kubectl create secret generic app-secrets \
  --from-file***REMOVED***.env
```

### Secret YAML

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # Values must be base64 encoded
  database-url: cG9zdGdyZXM6Ly8uLi4***REMOVED***
  jwt-secret: c3VwZXJzZWNyZXQ***REMOVED***
stringData:
  # Or use stringData for plain text
  api-key: my-api-key
```

### Using in Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: myapp:latest
      env:
        # Individual secrets
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
      envFrom:
        # All secrets as env vars
        - secretRef:
            name: app-secrets
      volumeMounts:
        # Secrets as files
        - name: secrets
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: secrets
      secret:
        secretName: app-secrets
```

### Sealed Secrets (GitOps-safe)

```bash
# Install kubeseal
brew install kubeseal

# Create sealed secret
kubectl create secret generic app-secrets \
  --from-literal***REMOVED***jwt-secret***REMOVED***'...' \
  --dry-run***REMOVED***client -o yaml | \
  kubeseal --format yaml > sealed-secret.yaml

# The sealed secret can be safely committed to git
```

---

## Secret Rotation

### Rotation Strategy

```typescript
interface SecretRotation {
  // Two-phase rotation
  steps: [
    'generate_new_secret',    // Create new secret
    'deploy_with_both',       // Accept both old and new
    'verify_new_works',       // Test new secret
    'deprecate_old',          // Mark old for removal
    'remove_old'              // Delete old secret
  ];
  
  // Timing
  rotationPeriod: '90 days';
  gracePeriod: '7 days';
}
```

### JWT Secret Rotation

```typescript
interface JWTConfig {
  currentSecret: string;
  previousSecret?: string;  // For graceful rotation
  keyId: string;            // For key identification
}

function verifyToken(token: string, config: JWTConfig): JWTPayload {
  const decoded ***REMOVED*** jwt.decode(token, { complete: true });
  
  // Try current secret first
  try {
    return jwt.verify(token, config.currentSecret) as JWTPayload;
  } catch (err) {
    // Fall back to previous secret during rotation
    if (config.previousSecret) {
      return jwt.verify(token, config.previousSecret) as JWTPayload;
    }
    throw err;
  }
}

function signToken(payload: JWTPayload, config: JWTConfig): string {
  return jwt.sign(payload, config.currentSecret, {
    keyid: config.keyId  // Include key ID in header
  });
}
```

### API Key Rotation

```typescript
// API key rotation workflow
async function rotateAPIKey(userId: string): Promise<void> {
  const user ***REMOVED*** await User.findById(userId);
  
  // 1. Generate new key
  const newKey ***REMOVED*** generateAPIKey();
  const newKeyHash ***REMOVED*** hashAPIKey(newKey);
  
  // 2. Add new key (keep old active)
  await APIKey.create({
    userId,
    keyHash: newKeyHash,
    prefix: newKey.substring(0, 8),
    createdAt: new Date(),
    expiresAt: null  // New key active
  });
  
  // 3. Notify user of new key
  await notifyUser(userId, `New API key: ${newKey}`);
  
  // 4. Mark old key for expiration
  await APIKey.updateMany(
    { userId, keyHash: { $ne: newKeyHash } },
    { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }  // 7 days
  );
  
  // 5. Scheduled job removes expired keys
}
```

---

## CI/CD Secrets

### GitHub Actions

```yaml
# Use encrypted secrets
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
        run: npm run deploy
```

### GitLab CI

```yaml
# Use CI/CD variables (masked + protected)
deploy:
  script:
    - echo $DATABASE_URL
  variables:
    DATABASE_URL: $DATABASE_URL
  only:
    - main
```

### Security Best Practices

```yaml
# ✅ Good: Secrets only in secure env
steps:
  - run: npm run deploy
    env:
      SECRET: ${{ secrets.MY_SECRET }}

# ❌ Bad: Secret in command line (logged)
steps:
  - run: npm run deploy --secret***REMOVED***${{ secrets.MY_SECRET }}

# ❌ Bad: Echoing secrets
steps:
  - run: echo ${{ secrets.MY_SECRET }}
```

---

## Application Patterns

### Config Module

```typescript
// config/index.ts
import { z } from 'zod';

const configSchema ***REMOVED*** z.object({
  database: z.object({
    url: z.string().url()
  }),
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().default('15m')
  }),
  redis: z.object({
    url: z.string().url()
  })
});

type Config ***REMOVED*** z.infer<typeof configSchema>;

let config: Config;

export async function loadConfig(): Promise<Config> {
  if (config) return config;
  
  const raw ***REMOVED*** {
    database: {
      url: process.env.DATABASE_URL
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    },
    redis: {
      url: process.env.REDIS_URL
    }
  };
  
  config ***REMOVED*** configSchema.parse(raw);
  return config;
}

export function getConfig(): Config {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return config;
}
```

### Never Log Secrets

```typescript
// ❌ Bad: Logging sensitive data
console.log('Connecting with:', databaseUrl);
console.log('User login:', { email, password });

// ✅ Good: Sanitized logging
console.log('Connecting to database...');
console.log('User login:', { email, password: '[REDACTED]' });

// Helper function
function sanitizeForLogging(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys ***REMOVED*** ['password', 'secret', 'token', 'key', 'authorization'];
  const sanitized ***REMOVED*** { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(k ***REMOVED***> key.toLowerCase().includes(k))) {
      sanitized[key] ***REMOVED*** '[REDACTED]';
    }
  }
  
  return sanitized;
}
```

---

## Audit Checklist

### Code Review

- [ ] No secrets in source code
- [ ] No secrets in comments
- [ ] .env files in .gitignore
- [ ] No secrets in error messages
- [ ] No secrets in logs

### Repository

- [ ] Pre-commit hooks configured
- [ ] Git history scanned for secrets
- [ ] .gitignore includes secret patterns
- [ ] GitHub secret scanning enabled

### Infrastructure

- [ ] Secrets in secret manager (not env vars on host)
- [ ] Rotation policy defined
- [ ] Access audit logging enabled
- [ ] Least privilege access

### CI/CD

- [ ] Secrets not printed in logs
- [ ] Secrets masked in output
- [ ] Protected branches for secrets
- [ ] No secrets in build artifacts
