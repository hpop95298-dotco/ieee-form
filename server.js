/**
 * Optional Local Development & Persistence Server for IEEE IU SB Registration Form
 * Uses only Node.js standard library (zero external dependencies).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

// Ensure data persistence directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// MIME types for static asset serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function handleRequest(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle Admin Login POST endpoint
  if (req.method === 'POST' && (req.url === '/api/admin-login' || req.url === '/api/admin-login/')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        const cleanEmail = (email || '').trim();
        const cleanPassword = (password || '').trim();

        // Exact Admin Credentials specified by user
        const ADMIN_EMAIL = '25030410';
        const ADMIN_PASS = 'Kazanova54321@';

        if (cleanEmail === ADMIN_EMAIL && cleanPassword === ADMIN_PASS) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            token: 'admin-auth-' + Buffer.from(cleanEmail + ':' + Date.now()).toString('base64'),
            message: 'Authentication successful'
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة السر.'
          }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid login payload' }));
      }
    });
    return;
  }

  // Handle Registration POST endpoint
  if (req.method === 'POST' && (req.url === '/api/register' || req.url === '/api/register/')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Server-side validation
        const fullName = (data.fullName || '').trim();
        const email = (data.email || '').trim();
        const studentId = (data.studentId || '').trim();
        const faculty = (data.faculty || '').trim();

        if (!fullName || !email || !studentId || !faculty) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'All fields (Full Name, Email Address, ID, and Faculty) are required.' }));
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid email address format.' }));
          return;
        }

        // Save registration record (preserving leading zeros and string format)
        const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
        const newRecord = {
          fullName,
          email,
          studentId, // raw string preserved
          faculty,
          submittedAt: data.submittedAt || new Date().toISOString()
        };

        currentData.push(newRecord);
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf8');

        console.log(`[Registration Saved] ID: ${studentId} | Name: ${fullName} | Faculty: ${faculty} | Email: ${email}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Your registration has been submitted successfully.' }));
      } catch (err) {
        console.error('Server error processing registration:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error while saving registration.' }));
      }
    });
    return;
  }

  // Read-only endpoint to check registered entries
  if (req.method === 'GET' && (req.url === '/api/registrations' || req.url === '/api/registrations/')) {
    try {
      const records = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(records);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read registrations' }));
    }
    return;
  }

  // Export registrations as CSV file (with UTF-8 BOM for Arabic support in Excel)
  if (req.method === 'GET' && (req.url === '/api/export-csv' || req.url === '/api/export-csv/')) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
      let csvContent = '\uFEFF"Index","Full Name","Email Address","Student ID","Faculty","Registered At"\n';

      data.forEach((item, index) => {
        const name = (item.fullName || '').replace(/"/g, '""');
        const email = (item.email || '').replace(/"/g, '""');
        const id = (item.studentId || '').replace(/"/g, '""');
        const faculty = (item.faculty || '').replace(/"/g, '""');
        const date = item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '';
        csvContent += `"${index + 1}","${name}","${email}","\t${id}","${faculty}","${date}"\n`;
      });

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="IEEE_IU_SB_Registrations.csv"'
      });
      res.end(csvContent);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to export CSV' }));
    }
    return;
  }

  // Delete a specific registration
  if (req.method === 'POST' && (req.url === '/api/delete-registration' || req.url === '/api/delete-registration/')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { studentId, index } = JSON.parse(body);
        let currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');

        if (typeof index === 'number' && index >= 0 && index < currentData.length) {
          currentData.splice(index, 1);
        } else if (studentId) {
          currentData = currentData.filter(r => r.studentId !== studentId);
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Target studentId or index required' }));
          return;
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: currentData.length }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to delete record' }));
      }
    });
    return;
  }

  // Serve Static Assets
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`IEEE IU SB Registration Server running at: http://localhost:${PORT}`);
    console.log(`Persistence file: ${DATA_FILE}`);
  });
}

module.exports = { server, handleRequest, DATA_FILE };
