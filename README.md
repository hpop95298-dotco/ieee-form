# IEEE IU SB Registration Form

A modern, responsive student registration form designed specifically for **IEEE Innovation University Student Branch (IEEE IU SB)**.

---

## 📌 Project Overview

This project implements a clean, accessible registration form that adheres strictly to IEEE IU SB branding guidelines and user requirements.

- **Strict Scope**: Single-purpose registration form only (no extraneous dashboards, committee selectors, or authentication flows).
- **Official Branding**: Integrated official Innovation University logo and IEEE Student Branch crest.
- **Form Fields**:
  1. `Full Name` (Text input)
  2. `Email Address` (Email format validation)
  3. `ID` (Alphanumeric/numeric input, preserving leading zeros)
  4. `Faculty` (Dropdown selection: Engineering, Computers & IT, Pharmacy, Dentistry, Nursing, Business, Physical Therapy)
- **Primary Action**: `Submit Registration`
- **Confirmation**: `Your registration has been submitted successfully.`

---

## 📁 File Structure

```text
c:\Users\ASUS\OneDrive\Desktop\form\
├── index.html                  # Accessible, semantic HTML5 registration form
├── success.html                # Dedicated confirmation page shown after submission
├── admin.html                  # Full-featured Admin Dashboard with search, filters & export
├── styles.css                  # Professional IEEE blue & responsive layout styles
├── app.js                      # Client-side validation, state handling, & submission logic
├── server.js                   # Node.js backend & persistence server
├── test.js                     # 77-test automated verification suite
├── package.json                # Project scripts (start, test)
├── assets/
│   ├── ieee-logo.png           # Official IEEE IU SB circular crest (uploaded asset)
│   └── innovation-university-logo.png # Official Innovation University logo (uploaded asset)
└── data/
    └── registrations.json      # Persistent storage when running local server
```

---

## 🚀 How to Run

### Option 1: Standalone Client (No Setup Required)
Simply open `index.html` directly in any web browser (Chrome, Edge, Firefox, Safari).
- Client validation and visual flow work immediately.

### Option 2: With Local Persistence Server
To run with local data persistence (saves submissions to `data/registrations.json`):
```bash
npm start
```
Then visit:
- **Registration Form**: `http://localhost:3000/index.html`
- **Admin Dashboard**: `http://localhost:3000/admin.html`

#### Admin Login Credentials:
- **Email / Identifier**: `25030410`
- **Password**: `Kazanova54321@`

---

## 🧪 Running Automated Tests

Run the comprehensive 80-assertion test suite:
```bash
npm test
```

This verifies:
1. Asset integrity and clean transparent background.
2. Aspect ratio protection (`object-fit: contain`).
3. Exact field labels, placeholders, titles, and button texts.
4. Input validation (empty fields, invalid emails, alphanumeric IDs, leading-zero preservation).
5. Duplicate submission prevention and loading state.
6. Persistence verification.
7. Admin authentication (200 on valid credentials, 401 on invalid).
8. CSV export and record deletion endpoints.

---

## 🗄️ Backend & Database Integration Guide

Because the workspace initially contained no configured database or backend, the application is designed to connect seamlessly to any backend:

### Connecting Supabase (Recommended)
1. In your Supabase project, execute this SQL:
```sql
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  student_id text not null,
  faculty text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.registrations enable row level security;

-- Allow public insert
create policy "Allow anonymous registrations" 
on public.registrations 
for insert 
with check (true);
```
2. Configure `window.IEEE_API_ENDPOINT` or initialize the Supabase client in `app.js` using your Supabase project URL and anon public key.

### Connecting Custom REST API
Set `window.IEEE_API_ENDPOINT = "https://your-api.com/api/register";` before `app.js` loads, or configure it directly in `app.js`.
The endpoint receives:
```json
{
  "fullName": "Student Name",
  "email": "student@example.com",
  "studentId": "00123456",
  "faculty": "Engineering",
  "submittedAt": "2026-10-29T00:00:00.000Z"
}
```
Response format:
```json
{ "success": true, "message": "Your registration has been submitted successfully." }
```

