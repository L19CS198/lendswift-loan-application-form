# LendSwift — Multi-Step Loan Application Form

> **ZeTheta Project 1A** — Front End Developer Internship  
> Built by: **Shanmukh Naga Teja** | Timeline: 15 Days

A production-grade, 8-step multi-step loan application form built for the LendSwift fintech platform, targeting tier-2 and tier-3 Indian cities.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Run unit tests
npm test

# 5. Run E2E tests (Cypress)
npm run test:e2e
```

---

## 🏗️ Architecture

### Tech Stack
| Concern | Library |
|---|---|
| UI Framework | React 18 + Vite |
| Form State | React Hook Form |
| Validation | Zod (schema-based) |
| Styling | Tailwind CSS |
| File Upload | React Dropzone |
| E-Signature | react-signature-canvas |
| E2E Testing | Cypress |
| Unit Testing | Vitest |
| Notifications | react-hot-toast |

### Pattern: Wizard Component with Step Registry
Uses **Pattern 3** from the spec — a central Wizard component with:
- `FormProvider` (Context + useReducer) as single source of truth
- Per-step form instances via React Hook Form
- `schemaFactory` returning dynamic Zod schemas based on full form state
- `useAutoSave` hook with AES-256-GCM encryption via Web Crypto API

### Directory Structure
```
src/
├── components/
│   ├── common/          # Reusable: Input, Select, RadioGroup, FileUpload, ESignature, ProgressBar
│   └── steps/           # Step1–Step8 components
├── hooks/
│   ├── useAutoSave.js   # Encrypted auto-save + resume functionality
│   └── useVerification.js # PAN/Aadhaar verification simulation
├── schemas/
│   └── allSchemas.js    # Zod schemas + schemaFactory
├── store/
│   └── formStore.jsx    # Global state (Context + useReducer)
├── utils/
│   ├── validators.js    # PAN, Aadhaar (Verhoeff), GST, EMI, image compression
│   ├── pinCodeData.js   # Indian PIN code lookup (100+ entries, all states)
│   └── encryption.js   # AES-256-GCM via Web Crypto API
├── App.jsx              # Wizard orchestrator
└── main.jsx
```

---

## ✅ Features Implemented

### 8 Form Steps
1. **Loan Type Selection** — Personal / Home / Business with dynamic amount, tenure, purpose
2. **Personal Information** — Name, DOB (age validation), gender, contact details
3. **KYC Verification** — PAN (entity type check) + Aadhaar (Verhoeff checksum) simulation
4. **Address Information** — PIN code auto-fill, permanent/current address, conditional rent field
5. **Employment & Income** — Dynamic sub-forms: Salaried / Self-Employed / Business Owner
6. **Co-Applicant** — Conditionally shown (Home loan always; Personal >₹5L; Business >₹20L)
7. **Documents & E-Signature** — Conditional docs by loan/employment type, Canvas signature
8. **Review & Submit** — KFS summary, EMI calculation, 4 RBI-compliant consent checkboxes

### Validation
- **PAN**: Format + entity type (4th char: P=Individual, C=Company, F=Firm, etc.)
- **Aadhaar**: 12-digit + Verhoeff checksum algorithm
- **GST**: 15-char format with state code + PAN embedded
- **Cross-step**: Business loan → blocks Salaried employment; DOB → max tenure; Loan amount → co-app trigger

### Auto-Save
- Saves every 30 seconds to localStorage
- AES-256-GCM encrypted via Web Crypto API
- Resume modal on page reload
- 72-hour TTL auto-purge

### RBI Compliance
- Key Fact Statement (KFS) in Step 8
- Separate explicit consent checkboxes (no pre-ticking)
- Cooling-off period disclosure
- Grievance officer details
- Data minimality principle followed

---

## 🔢 EMI Formula

```
EMI = P × r × (1+r)^n / ((1+r)^n – 1)

Where:
  P = Principal loan amount
  r = Monthly interest rate (annual rate / 12 / 100)
  n = Tenure in months

Rates: Personal=10.5% | Home=8.5% | Business=14%
Processing Fee = 1% of loan amount (min ₹2,000, max ₹25,000)
```

---

## 🧪 Running Tests

```bash
# Unit tests
npm test

# E2E with UI
npm run test:e2e

# E2E headless
npm run test:e2e:run
```

### Cypress Test Coverage (15+ journeys)
- `personal-loan-happy-path.cy.js`
- `home-loan-happy-path.cy.js`
- `business-loan-happy-path.cy.js`
- `validation-errors.cy.js` (8 step-level tests)
- `auto-save-resume.cy.js`
- `file-upload.cy.js`
- `e-signature.cy.js`
- `keyboard-navigation.cy.js`
- `stress-test.cy.js`
- `cross-step-dependency.cy.js`

---

## 📋 Git Workflow

```
main                    → always deployable
feature/step-1-loan-type
feature/step-2-personal-info
feature/step-3-kyc-verification
feature/step-4-address
feature/step-5-employment
feature/step-6-co-applicant
feature/step-7-documents
feature/step-8-review
feature/auto-save
feature/e2e-tests
feature/accessibility-audit
```

Commit format: `feat(step3): add PAN verification simulation`

---

## 🌐 Deployment

Deploy to Vercel:
```bash
npm run build
# Upload dist/ folder or connect GitHub repo to Vercel
```

---

## 📬 Submission

Repository: [GitHub link here]  
Applicant: Shanmukh Naga Teja  
Platform: ZeTheta Algorithms Private Limited  
Project: 1A — Front End Developer Multi Step Loan Application Form
