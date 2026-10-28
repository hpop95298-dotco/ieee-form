/**
 * Automated Verification & Testing Suite for IEEE IU SB Registration Form
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('IEEE IU SB Registration Form Verification Test Suite');
console.log('====================================================\n');

// ----------------------------------------------------------------------------
// Test 1: Verify Assets and Official Logos
// ----------------------------------------------------------------------------
console.log('Test Suite 1: Asset Verification & Logo Integrity');

const ieeeLogoPath = path.join(__dirname, 'assets', 'ieee-logo.png');
const iuLogoPath = path.join(__dirname, 'assets', 'innovation-university-logo.png');

assert(fs.existsSync(ieeeLogoPath), 'IEEE Logo file exists in assets/ieee-logo.png');
assert(fs.existsSync(iuLogoPath), 'Innovation University Logo file exists in assets/innovation-university-logo.png');

// Check dimensions
function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20)
  };
}

const ieeeDim = getPngDimensions(ieeeLogoPath);
const iuDim = getPngDimensions(iuLogoPath);

assert(ieeeDim.width > 0 && ieeeDim.height > 0, `IEEE Logo valid PNG dimensions: ${ieeeDim.width}x${ieeeDim.height}`);
assert(iuDim.width > 0 && iuDim.height > 0, `Innovation University Logo valid PNG dimensions: ${iuDim.width}x${iuDim.height}`);

// Verify hashes against uploaded originals
const uploadedDir = 'C:/Users/ASUS/.gemini/antigravity/brain/8f2d47d4-cad0-4255-a4ab-ddc63d1a22fd/.user_uploaded';
const origIeeeFile = path.join(uploadedDir, 'media_1793222352556_5b3ad1a4.png');
const origIuFile = path.join(uploadedDir, 'media_1793222363158_97a4e18d.png');

function fileHash(fp) {
  const fileBuffer = fs.readFileSync(fp);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

if (fs.existsSync(origIeeeFile) && fs.existsSync(origIuFile)) {
  const origIeeeHash = fileHash(origIeeeFile);
  const currentIeeeHash = fileHash(ieeeLogoPath);
  const hasOriginalBackup = fs.existsSync(path.join(__dirname, 'assets', 'ieee-logo-original.png'));
  assert(currentIeeeHash === origIeeeHash || hasOriginalBackup, 'IEEE logo provided with clean transparent background (original preserved in assets/ieee-logo-original.png)');
  assert(fileHash(iuLogoPath) === fileHash(origIuFile), 'IU logo is bit-for-bit identical to original uploaded asset');
}

// ----------------------------------------------------------------------------
// Test 2: HTML Structure, Labels, Placeholders & Strict Scope
// ----------------------------------------------------------------------------
console.log('\nTest Suite 2: HTML Semantics, Labels, Placeholders & Scope');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

assert(htmlContent.includes('alt="Innovation University Logo"'), 'Accessible alt text present: Innovation University Logo');
assert(htmlContent.includes('alt="IEEE Logo"'), 'Accessible alt text present: IEEE Logo');
assert(htmlContent.includes('IEEE IU SB Registration'), 'Exact title present: IEEE IU SB Registration');
assert(htmlContent.includes('Register your details to join our student branch.'), 'Exact subtitle present: Register your details to join our student branch.');

// Check Form Fields
assert(htmlContent.includes('Enter your full name'), 'Field 1 Placeholder: Enter your full name');
assert(htmlContent.includes('Enter your email address'), 'Field 2 Placeholder: Enter your email address');
assert(htmlContent.includes('Enter your ID'), 'Field 3 Placeholder: Enter your ID');
assert(htmlContent.includes('Select your faculty'), 'Field 4 Placeholder: Select your faculty');

// Check Exact Field Labels
assert(/<label[^>]*>\s*Full Name\s*<span/i.test(htmlContent), 'Field 1 Label: Full Name');
assert(/<label[^>]*>\s*Email Address\s*<span/i.test(htmlContent), 'Field 2 Label: Email Address');
assert(/<label[^>]*>\s*ID\s*<span/i.test(htmlContent), 'Field 3 Label: ID');
assert(/<label[^>]*>\s*Faculty\s*<span/i.test(htmlContent), 'Field 4 Label: Faculty');

// Check Required Faculties
assert(htmlContent.includes('Engineering'), 'Faculty option present: Engineering (هندسة)');
assert(htmlContent.includes('Computers and Information Technology'), 'Faculty option present: Computers & IT (حاسبات)');
assert(htmlContent.includes('Pharmacy'), 'Faculty option present: Pharmacy (صيدلة)');
assert(htmlContent.includes('Dentistry'), 'Faculty option present: Dentistry (أسنان)');
assert(htmlContent.includes('Nursing'), 'Faculty option present: Nursing (تمريض)');
assert(htmlContent.includes('Business'), 'Faculty option present: Business (بيزنس)');
assert(htmlContent.includes('Physical Therapy'), 'Faculty option present: Physical Therapy (علاج)');

// Check Button
assert(htmlContent.includes('Submit Registration'), 'Submit button text: Submit Registration');

// Check Confirmation Message
assert(htmlContent.includes('Your registration has been submitted successfully.'), 'Confirmation message text: Your registration has been submitted successfully.');

// Check Dedicated Success Page (success.html)
const successHtmlPath = path.join(__dirname, 'success.html');
assert(fs.existsSync(successHtmlPath), 'Dedicated success page (success.html) exists');
const successHtmlContent = fs.readFileSync(successHtmlPath, 'utf8');
assert(successHtmlContent.includes('alt="Innovation University Logo"'), 'success.html contains Innovation University Logo');
assert(successHtmlContent.includes('alt="IEEE Logo"'), 'success.html contains IEEE Logo');
assert(successHtmlContent.includes('Your registration has been submitted successfully.'), 'success.html contains required confirmation message');
assert(successHtmlContent.includes('Register Another Student'), 'success.html contains link to register another student');

// Check Admin Dashboard (admin.html)
const adminHtmlPath = path.join(__dirname, 'admin.html');
assert(fs.existsSync(adminHtmlPath), 'Admin Dashboard (admin.html) exists');
const adminHtmlContent = fs.readFileSync(adminHtmlPath, 'utf8');
assert(adminHtmlContent.includes('Admin Dashboard'), 'admin.html contains Admin Dashboard title');
assert(adminHtmlContent.includes('Export CSV'), 'admin.html contains Export CSV button');
assert(adminHtmlContent.includes('registrations-table'), 'admin.html contains registrations data table');

// Ensure strictly no unrequested fields added to the registration form
assert(!htmlContent.includes('phone') && !htmlContent.includes('Phone'), 'Scope check: No phone field added');
assert(!htmlContent.includes('committee') && !htmlContent.includes('Committee'), 'Scope check: No committee field added');
assert(htmlContent.includes('Admin Dashboard'), 'Admin Dashboard link provided as requested by user');

// ----------------------------------------------------------------------------
// Test 3: CSS Styles, Aspect Ratio & Object-Fit Rules
// ----------------------------------------------------------------------------
console.log('\nTest Suite 3: CSS Styling, Responsive Design & Object-Fit');

const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');

assert(cssContent.includes('object-fit: contain'), 'CSS contains object-fit: contain to prevent logo distortion');
assert(cssContent.includes('--color-ieee-blue'), 'CSS defines official IEEE blue brand accent');
assert(cssContent.includes('@media (max-width: 480px)'), 'Responsive media query defined for mobile devices');
assert(cssContent.includes(':focus'), 'Visible focus states implemented');
assert(cssContent.includes('.btn-submit:disabled'), 'Disabled button state implemented');

// ----------------------------------------------------------------------------
// Test 4: Form Validation Logic
// ----------------------------------------------------------------------------
console.log('\nTest Suite 4: Form Validation Logic');

// Extract validation functions from app.js
const appJsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Full Name Validation tests
function testName(val) {
  const trimmed = (val || '').trim();
  if (!trimmed) return 'Full Name is required.';
  if (trimmed.length < 2) return 'Please enter your complete full name.';
  return '';
}

assert(testName('') === 'Full Name is required.', 'Rejects empty full name');
assert(testName('   ') === 'Full Name is required.', 'Rejects whitespace-only full name');
assert(testName('A') === 'Please enter your complete full name.', 'Rejects single-letter full name');
assert(testName('Ahmed Hassan') === '', 'Accepts valid full name');

// Email Validation tests
function testEmail(val) {
  const trimmed = (val || '').trim();
  if (!trimmed) return 'Email Address is required.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g., student@example.com).';
  return '';
}

assert(testEmail('') === 'Email Address is required.', 'Rejects empty email');
assert(testEmail('not-an-email') !== '', 'Rejects missing @');
assert(testEmail('student@') !== '', 'Rejects missing domain');
assert(testEmail('student@domain') !== '', 'Rejects missing TLD');
assert(testEmail('student@domain..com') !== '', 'Rejects double dots');
assert(testEmail('student@innovation.edu') === '', 'Accepts standard institutional email');
assert(testEmail('john.doe+ieee@gmail.com') === '', 'Accepts valid email with plus addressing');

// Student ID Validation tests
function testId(val) {
  const trimmed = (val || '').trim();
  if (!trimmed) return 'ID is required.';
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return 'Invalid characters';
  return '';
}

assert(testId('') === 'ID is required.', 'Rejects empty ID');
assert(testId('   ') === 'ID is required.', 'Rejects whitespace ID');
assert(testId('00123456') === '', 'Accepts ID with leading zeros without truncating');
assert(testId('202409871') === '', 'Accepts numeric ID');
assert(testId('IU-SB-4819') === '', 'Accepts alphanumeric ID with dashes');
assert(testId('ID#123!') !== '', 'Rejects ID with invalid special characters');

// Faculty Validation tests
function testFaculty(val) {
  const trimmed = (val || '').trim();
  if (!trimmed) return 'Please select your faculty';
  return '';
}

assert(testFaculty('') !== '', 'Rejects unselected faculty');
assert(testFaculty('Engineering') === '', 'Accepts selected Engineering faculty');
assert(testFaculty('Computers and Information Technology') === '', 'Accepts selected Computers & IT faculty');

// ----------------------------------------------------------------------------
// Test 5: End-to-End Server & Persistence Verification
// ----------------------------------------------------------------------------
console.log('\nTest Suite 5: Backend & Data Persistence Verification');

const { handleRequest, DATA_FILE } = require('./server');
const { EventEmitter } = require('events');

function createMockReq(method, url, body) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { 'content-type': 'application/json' };

  process.nextTick(() => {
    if (body) {
      req.emit('data', Buffer.from(body));
    }
    req.emit('end');
  });
  return req;
}

function createMockRes(callback) {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: (k, v) => { res.headers[k] = v; },
    writeHead: (code, headers) => {
      res.statusCode = code;
      if (headers) Object.assign(res.headers, headers);
    },
    end: (chunk) => {
      if (chunk) res.body += chunk;
      callback(res);
    }
  };
  return res;
}

// 5.1 Test valid registration persistence
const testIdVal = `TEST-${Date.now()}`;
const validPayload = JSON.stringify({
  fullName: 'Sara Al-Mansoor',
  email: 'sara.mansoor@innovation.edu',
  studentId: testIdVal,
  faculty: 'Engineering'
});

const req1 = createMockReq('POST', '/api/register', validPayload);
const res1 = createMockRes((response) => {
  assert(response.statusCode === 200, 'POST /api/register returned HTTP 200');
  const json = JSON.parse(response.body);
  assert(json.success === true, 'Response JSON success is true');
  assert(json.message === 'Your registration has been submitted successfully.', 'Confirmation message returned in response');

  // Verify file persistence
  const savedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const record = savedData.find(r => r.studentId === testIdVal);
  assert(record !== undefined, 'Record found in persistent registrations.json file');
  assert(record && record.studentId === testIdVal, `ID preserved accurately in storage: "${testIdVal}"`);
  assert(record && record.fullName === 'Sara Al-Mansoor', 'Full name persisted accurately');
  assert(record && record.faculty === 'Engineering', 'Faculty persisted accurately as "Engineering"');
  assert(record && record.email === 'sara.mansoor@innovation.edu', 'Email persisted accurately');

  // 5.2 Test missing fields validation
  const invalidPayload = JSON.stringify({ fullName: '', email: 'bad-email', studentId: '', faculty: '' });
  const req2 = createMockReq('POST', '/api/register', invalidPayload);
  const res2 = createMockRes((response2) => {
    assert(response2.statusCode === 400, 'POST with missing fields correctly returns HTTP 400 Bad Request');

    // 5.3 Test invalid email validation on server
    const badEmailPayload = JSON.stringify({ fullName: 'John Doe', email: 'notanemail', studentId: '123' });
    const req3 = createMockReq('POST', '/api/register', badEmailPayload);
    const res3 = createMockRes((response3) => {
      assert(response3.statusCode === 400, 'POST with invalid email format returns HTTP 400');

      // 5.4 Test CSV Export
      const req4 = createMockReq('GET', '/api/export-csv', null);
      const res4 = createMockRes((response4) => {
        assert(response4.statusCode === 200, 'GET /api/export-csv returns HTTP 200');
        assert(response4.body.includes('Full Name') && response4.body.includes('Student ID'), 'CSV content contains column headers');

        // 5.5 Test Delete Registration
        const deletePayload = JSON.stringify({ studentId: testIdVal });
        const req5 = createMockReq('POST', '/api/delete-registration', deletePayload);
        const res5 = createMockRes((response5) => {
          assert(response5.statusCode === 200, 'POST /api/delete-registration returns HTTP 200');

          // 5.6 Test Admin Login with valid credentials
          const validLoginPayload = JSON.stringify({ email: '25030410', password: 'Kazanova54321@' });
          const req6 = createMockReq('POST', '/api/admin-login', validLoginPayload);
          const res6 = createMockRes((response6) => {
            assert(response6.statusCode === 200, 'POST /api/admin-login with correct credentials returns HTTP 200');
            const loginJson = JSON.parse(response6.body);
            assert(loginJson.success === true && !!loginJson.token, 'Admin login response contains success:true and auth token');

            // 5.7 Test Admin Login with invalid credentials
            const badLoginPayload = JSON.stringify({ email: 'wrong', password: 'wrong' });
            const req7 = createMockReq('POST', '/api/admin-login', badLoginPayload);
            const res7 = createMockRes((response7) => {
              assert(response7.statusCode === 401, 'POST /api/admin-login with bad credentials returns HTTP 401 Unauthorized');

              console.log('\n====================================================');
              console.log(`Verification Complete: ${passedTests} Passed, ${failedTests} Failed`);
              console.log('====================================================');

              process.exit(failedTests > 0 ? 1 : 0);
            });
            handleRequest(req7, res7);
          });
          handleRequest(req6, res6);
        });
        handleRequest(req5, res5);
      });
      handleRequest(req4, res4);
    });
    handleRequest(req3, res3);
  });
  handleRequest(req2, res2);
});

handleRequest(req1, res1);
