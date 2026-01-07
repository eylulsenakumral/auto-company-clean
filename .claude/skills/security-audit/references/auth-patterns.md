# Authentication & Authorization Patterns

Secure patterns for identity verification and access control.

## Authentication Methods

### Password-Based

#### Password Storage

```typescript
// ✅ Correct: bcrypt with cost factor
import bcrypt from 'bcrypt';
const SALT_ROUNDS ***REMOVED*** 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```typescript
// ✅ Alternative: Argon2id (recommended for new systems)
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

#### Password Requirements

```typescript
interface PasswordPolicy {
  minLength: 12;           // NIST recommends 8+, 12+ is better
  maxLength: 128;          // Prevent DoS on hashing
  requireUppercase: false; // NIST discourages complexity rules
  requireLowercase: false;
  requireNumbers: false;
  requireSpecial: false;
  checkCommonPasswords: true;  // Block common passwords
  checkBreached: true;         // Check Have I Been Pwned
}
```

```typescript
// Check against breached passwords
import crypto from 'crypto';

async function isPasswordBreached(password: string): Promise<boolean> {
  const sha1 ***REMOVED*** crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix ***REMOVED*** sha1.substring(0, 5);
  const suffix ***REMOVED*** sha1.substring(5);
  
  const response ***REMOVED*** await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text ***REMOVED*** await response.text();
  
  return text.includes(suffix);
}
```

---

### JWT Authentication

#### Token Structure

```typescript
interface JWTPayload {
  sub: string;      // User ID (subject)
  iat: number;      // Issued at
  exp: number;      // Expiration
  jti: string;      // JWT ID (for revocation)
  iss: string;      // Issuer
  aud: string;      // Audience
  scope?: string;   // Permissions
}
```

#### Secure JWT Implementation

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET ***REMOVED*** process.env.JWT_SECRET!; // Strong secret, 256+ bits
const ACCESS_TOKEN_TTL ***REMOVED*** '15m';
const REFRESH_TOKEN_TTL ***REMOVED*** '7d';

function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      scope: user.permissions.join(' '),
      jti: crypto.randomUUID()
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',  // Or RS256 for asymmetric
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: 'api.example.com',
      audience: 'example.com'
    }
  );
}

function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],  // Explicitly specify allowed algorithms
    issuer: 'api.example.com',
    audience: 'example.com',
    complete: false
  }) as JWTPayload;
}
```

#### Refresh Token Rotation

```typescript
interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;  // Detect token reuse
  expiresAt: Date;
  createdAt: Date;
}

async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const tokenHash ***REMOVED*** hashToken(refreshToken);
  const storedToken ***REMOVED*** await RefreshToken.findOne({ tokenHash });
  
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }
  
  // Detect token reuse (potential theft)
  const familyTokens ***REMOVED*** await RefreshToken.find({ familyId: storedToken.familyId });
  if (familyTokens.some(t ***REMOVED***> t.id !***REMOVED******REMOVED*** storedToken.id && t.createdAt > storedToken.createdAt)) {
    // Token reuse detected - invalidate entire family
    await RefreshToken.deleteMany({ familyId: storedToken.familyId });
    throw new Error('Token reuse detected');
  }
  
  // Rotate: invalidate old, create new
  await RefreshToken.delete({ id: storedToken.id });
  
  const newRefreshToken ***REMOVED*** await createRefreshToken(storedToken.userId, storedToken.familyId);
  const newAccessToken ***REMOVED*** generateAccessToken(await User.findById(storedToken.userId));
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

---

### Session-Based Authentication

#### Secure Session Configuration

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient ***REMOVED*** createClient({ url: process.env.REDIS_URL });

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  name: '__Host-session',  // Cookie prefix for additional security
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          // HTTPS only
    httpOnly: true,        // No JS access
    sameSite: 'strict',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    domain: undefined,     // Current domain only
    path: '/'
  }
}));
```

#### Session Regeneration

```typescript
// Always regenerate session on login
app.post('/login', async (req, res) ***REMOVED***> {
  const user ***REMOVED*** await authenticateUser(req.body);
  
  req.session.regenerate((err) ***REMOVED***> {
    if (err) return res.status(500).json({ error: 'Session error' });
    
    req.session.userId ***REMOVED*** user.id;
    req.session.loginTime ***REMOVED*** Date.now();
    req.session.ip ***REMOVED*** req.ip;
    
    res.json({ success: true });
  });
});

// Validate session consistency
function validateSession(req: Request, res: Response, next: NextFunction) {
  if (req.session.ip && req.session.ip !***REMOVED******REMOVED*** req.ip) {
    // IP changed - potential session hijacking
    req.session.destroy(() ***REMOVED***> {});
    return res.status(401).json({ error: 'Session invalid' });
  }
  next();
}
```

---

## Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  USER ***REMOVED*** 'user',
  ADMIN ***REMOVED*** 'admin',
  SUPER_ADMIN ***REMOVED*** 'super_admin'
}

interface User {
  id: string;
  roles: Role[];
}

function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) ***REMOVED***> {
    const user ***REMOVED*** req.user as User;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasRole ***REMOVED*** roles.some(role ***REMOVED***> user.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.delete('/api/users/:id', authenticate, requireRole(Role.ADMIN), deleteUser);
```

### Permission-Based Access Control

```typescript
enum Permission {
  READ_USERS ***REMOVED*** 'users:read',
  WRITE_USERS ***REMOVED*** 'users:write',
  DELETE_USERS ***REMOVED*** 'users:delete',
  READ_ORDERS ***REMOVED*** 'orders:read',
  WRITE_ORDERS ***REMOVED*** 'orders:write'
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> ***REMOVED*** {
  [Role.USER]: [Permission.READ_USERS, Permission.READ_ORDERS],
  [Role.ADMIN]: [Permission.READ_USERS, Permission.WRITE_USERS, Permission.READ_ORDERS, Permission.WRITE_ORDERS],
  [Role.SUPER_ADMIN]: Object.values(Permission)
};

function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) ***REMOVED***> {
    const user ***REMOVED*** req.user as User;
    const userPermissions ***REMOVED*** user.roles.flatMap(role ***REMOVED***> ROLE_PERMISSIONS[role]);
    
    const hasPermissions ***REMOVED*** permissions.every(p ***REMOVED***> userPermissions.includes(p));
    
    if (!hasPermissions) {
      return res.status(403).json({ 
        error: 'Missing required permissions',
        required: permissions
      });
    }
    
    next();
  };
}
```

### Resource-Based Authorization

```typescript
// Ownership check middleware
async function requireOwnership(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) ***REMOVED***> {
    const user ***REMOVED*** req.user as User;
    const resourceId ***REMOVED*** req.params.id;
    
    const resource ***REMOVED*** await getResource(resourceType, resourceId);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check ownership
    if (resource.userId !***REMOVED******REMOVED*** user.id && !user.roles.includes(Role.ADMIN)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    req.resource ***REMOVED*** resource;
    next();
  };
}

// Usage
app.put('/api/posts/:id', authenticate, requireOwnership('post'), updatePost);
```

---

## Multi-Factor Authentication

### TOTP Implementation

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate secret for user
async function setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret ***REMOVED*** speakeasy.generateSecret({
    name: `MyApp:${userId}`,
    issuer: 'MyApp'
  });
  
  const qrCode ***REMOVED*** await QRCode.toDataURL(secret.otpauth_url!);
  
  // Store secret (encrypted) temporarily until verified
  await MFASetup.create({
    userId,
    secret: encrypt(secret.base32),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
  
  return { secret: secret.base32, qrCode };
}

// Verify and enable MFA
async function verifyAndEnableMFA(userId: string, token: string): Promise<boolean> {
  const setup ***REMOVED*** await MFASetup.findOne({ userId });
  
  if (!setup || setup.expiresAt < new Date()) {
    throw new Error('MFA setup expired');
  }
  
  const secret ***REMOVED*** decrypt(setup.secret);
  
  const verified ***REMOVED*** speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1  // Allow 1 step tolerance
  });
  
  if (verified) {
    await User.update(userId, { mfaSecret: setup.secret, mfaEnabled: true });
    await MFASetup.delete({ userId });
  }
  
  return verified;
}

// Verify TOTP during login
function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: decrypt(secret),
    encoding: 'base32',
    token,
    window: 1
  });
}
```

### Recovery Codes

```typescript
async function generateRecoveryCodes(userId: string): Promise<string[]> {
  const codes ***REMOVED*** Array.from({ length: 10 }, () ***REMOVED***> 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  // Store hashed codes
  const hashedCodes ***REMOVED*** await Promise.all(
    codes.map(async code ***REMOVED***> ({
      hash: await bcrypt.hash(code, 10),
      used: false
    }))
  );
  
  await User.update(userId, { recoveryCodes: hashedCodes });
  
  // Return plain codes once - user must save them
  return codes;
}

async function useRecoveryCode(userId: string, code: string): Promise<boolean> {
  const user ***REMOVED*** await User.findById(userId);
  
  for (const storedCode of user.recoveryCodes) {
    if (!storedCode.used && await bcrypt.compare(code, storedCode.hash)) {
      storedCode.used ***REMOVED*** true;
      await user.save();
      return true;
    }
  }
  
  return false;
}
```

---

## Security Controls
