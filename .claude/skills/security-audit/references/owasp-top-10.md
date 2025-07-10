# OWASP Top 10 Reference

The OWASP Top 10 represents the most critical web application security risks.

## A01:2021 – Broken Access Control

### Description
Access control enforces policy such that users cannot act outside their intended permissions.

### Detection Patterns

```bash
# Missing authorization checks
grep -rn "router\.\(get\|post\|put\|delete\)" --include***REMOVED***"*.ts" | \
  xargs -I{} sh -c 'grep -L "auth\|authorize\|permission" "{}"'

# Direct object references without ownership check
grep -rn "params\.id\|params\.userId" --include***REMOVED***"*.ts" | grep -v "owner\|author"

# Horizontal privilege escalation
grep -rn "findById\|findOne" --include***REMOVED***"*.ts" | grep -v "where.*userId"
```

### Vulnerable Code

```typescript
// IDOR: Any user can access any order
app.get('/api/orders/:id', async (req, res) ***REMOVED***> {
  const order ***REMOVED*** await Order.findById(req.params.id);
  res.json(order); // ❌ No ownership check
});

// Missing function-level access control
app.delete('/api/users/:id', async (req, res) ***REMOVED***> {
  await User.delete(req.params.id); // ❌ No admin check
});
```

### Fixed Code

```typescript
// IDOR prevention
app.get('/api/orders/:id', authenticate, async (req, res) ***REMOVED***> {
  const order ***REMOVED*** await Order.findOne({
    where: { id: req.params.id, userId: req.user.id } // ✅ Ownership check
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

// Function-level access control
app.delete('/api/users/:id', authenticate, requireRole('admin'), async (req, res) ***REMOVED***> {
  await User.delete(req.params.id);
  res.status(204).send();
});
```

---

## A02:2021 – Cryptographic Failures

### Description
Failures related to cryptography which often leads to sensitive data exposure.

### Detection Patterns

```bash
# Weak hashing
grep -rn "md5\|sha1\|crypto\.createHash" --include***REMOVED***"*.ts" --include***REMOVED***"*.js"

# Hardcoded secrets
grep -rn "password\s****REMOVED***\s*['\"]" --include***REMOVED***"*.ts" --include***REMOVED***"*.js"
grep -rn "apiKey\s****REMOVED***\s*['\"]" --include***REMOVED***"*.ts" --include***REMOVED***"*.js"

# Insecure random
grep -rn "Math\.random" --include***REMOVED***"*.ts" --include***REMOVED***"*.js"
```

### Vulnerable Code

```typescript
// Weak password hashing
const hash ***REMOVED*** crypto.createHash('md5').update(password).digest('hex');

// Insecure random for tokens
const token ***REMOVED*** Math.random().toString(36).substring(2);

// Sensitive data in logs
console.log(`User ${email} logged in with token ${token}`);
```

### Fixed Code

```typescript
// Strong password hashing
import bcrypt from 'bcrypt';
const hash ***REMOVED*** await bcrypt.hash(password, 12);

// Cryptographically secure random
import crypto from 'crypto';
const token ***REMOVED*** crypto.randomBytes(32).toString('hex');

// Sanitized logging
console.log(`User ${email.substring(0, 3)}*** logged in`);
```

---

## A03:2021 – Injection

### Description
User-supplied data is not validated, filtered, or sanitized by the application.

### Detection Patterns

```bash
# SQL Injection
grep -rn "query\s*(\s*['\`].*\$\|+" --include***REMOVED***"*.ts"
grep -rn "execute\s*(\s*['\`].*\$\|+" --include***REMOVED***"*.ts"

# Command Injection
grep -rn "exec\s*(\|spawn\s*(\|execSync" --include***REMOVED***"*.ts"
grep -rn "child_process" --include***REMOVED***"*.ts"

# NoSQL Injection
grep -rn "find\s*(\s*{.*req\." --include***REMOVED***"*.ts"
grep -rn "\$where\|\$regex" --include***REMOVED***"*.ts"
```
