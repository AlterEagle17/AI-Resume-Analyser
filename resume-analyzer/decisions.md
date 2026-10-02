# Decisions

# Decision document

## 1. Scope of version one

### Decision
Build a simple AI Resume Analyzer that accepts one PDF resume and a target job role.

The application will:
- Accept one PDF resume.
- Support four target roles:
  - Frontend developer
  - Backend developer
  - Full-stack developer
  - AI engineer
- Extract resume text.
- Analyze the resume using AI.
- Return a score out of 100.
- Show skills found.
- Show skills missing.
- Give exactly three improvement suggestions.

### Options considered
- Build only a UI prototype.
- Build the complete application with authentication, history, payments, and other features.
- Build a small focused V1.

### Chosen
Build a small focused V1.

### Why
A smaller V1 is easier to build, test, debug, and deploy. It also allows the core resume-analysis workflow to be validated before adding extra features.

### Revisit when
The core analyzer works reliably and real users need additional features.

---

## 2. Application architecture

### Decision
Use React + Vite for the frontend and Node.js + Express for the backend.

Flow:

React UI
→ Express API
→ PDF text extraction
→ Groq API
→ React results

### Options considered
- Browser → Groq API directly.
- Serverless functions only.
- React frontend + Node.js/Express backend.

### Chosen
React + Node.js/Express.

### Why
The Groq API key must remain on the server. The Express server also gives one place for validation, error handling, rate limits, and cost protection.

### Revisit when
The application grows enough to require a different deployment or backend architecture.

---

## 3. Resume processing

### Decision
Extract text from the uploaded PDF on the server before sending relevant text to the AI.

### Options considered
- Send the PDF directly to the AI.
- Extract PDF text on the browser.
- Extract PDF text on the server.

### Chosen
Server-side PDF text extraction.

### Why
The server can validate the file, enforce the size limit, extract text consistently, and keep processing logic away from the browser.

### Revisit when
Support for scanned/image-only resumes becomes an important requirement.

---

## 4. AI provider

### Decision
Use the Groq API for resume analysis.

### Options considered
- Groq API.
- Direct browser-to-AI requests.
- Another AI provider.

### Chosen
Groq API through the Express backend.

### Why
The AI provider should only be accessed from the server so the API key is not exposed to the browser.

### Revisit when
AI quality, pricing, availability, or application requirements justify evaluating another provider.

---

## 5. AI response format

### Decision
Request structured JSON from the AI and validate the response before returning it to the frontend.

### Options considered
- Free-form text response.
- Structured JSON without validation.
- Structured JSON with schema validation.

### Chosen
Structured JSON with schema validation.

### Why
The frontend needs predictable fields such as score, verdict, skills found, skills missing, and exactly three improvement suggestions.

### Revisit when
The result format changes or additional analysis fields are required.

---

## 6. Resume storage

### Decision
Do not permanently store the original resume PDF.

Store analysis results and cost information only when persistence is added.

### Options considered
- Store uploaded resumes.
- Store resumes temporarily only during processing.
- Permanently store resumes and analysis results.

### Chosen
Process the PDF temporarily in memory and do not permanently store the original resume.

### Why
The V1 does not require resume storage, which keeps the application simpler and reduces unnecessary handling of personal documents.

### Revisit when
Users explicitly need resume history, resume management, or another feature that requires storing the original document.

---

## 7. Authentication

### Decision
Do not add authentication in V1.

### Options considered
- Add login and user accounts immediately.
- Build the core analyzer first without authentication.

### Chosen
No authentication in V1.

### Why
The first version should focus on proving the resume-analysis workflow instead of adding account management complexity.

### Revisit when
User accounts, saved history, or personalized features become necessary.

---

## 8. Database

### Decision
MongoDB will be added after the core analyzer works.

### Options considered
- Add MongoDB immediately.
- Build the analyzer without a database first.
- Use another database.

### Chosen
Add MongoDB after the core analyzer is functional.

### Why
The database is not required for the basic analysis flow. Delaying it keeps the early development and debugging simpler.

### Revisit when
The application needs persistent analysis history, usage tracking, or cost tracking.

---

## 9. Frontend and backend responsibilities

### Decision
The frontend handles user interaction and displaying results. The backend handles file validation, PDF extraction, AI communication, and server-side validation.

### Options considered
- Put most logic in React.
- Put all logic in the backend.
- Separate responsibilities between frontend and backend.

### Chosen
Separate responsibilities between frontend and backend.

### Why
This keeps the frontend simple and prevents sensitive operations such as AI API access from being exposed to the browser.

### Revisit when
The application architecture changes significantly.

---

## 10. Version one limits

### Decision
Keep V1 intentionally small.

V1 will not include:
- Authentication
- Payments
- Resume history
- Permanent resume storage
- Admin dashboard
- Multiple resume uploads
- Advanced analytics
- Mobile application

### Options considered
- Add these features immediately.
- Keep them outside V1.

### Chosen
Keep them outside V1.

### Why
The main goal is to validate the core workflow:

Upload resume
→ Extract text
→ Analyze with AI
→ Display useful results

### Revisit when
The core workflow is stable and additional user needs are identified.

## Target job role input

Decision:
Allow users to type any target job role.

Options considered:
- Fixed dropdown roles
- Free-text job role

Chosen:
Free-text job role.

Why:
Job titles vary widely, and users may apply for roles that are not included in a predefined list.

Revisit when:
The application needs standardized role taxonomy, job-role suggestions, or role-specific templates.