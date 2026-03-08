# GynoVision AI — Frontend

> A multimodal AI decision-support interface for gynecological cancer assessment, built with React, TypeScript, and Tailwind CSS.

---

## Overview

The GynoVision AI frontend is a modern, clinical-grade single-page application that surfaces four AI-powered cancer screening modules through an accessible, responsive UI. It communicates with dedicated Python model servers via REST APIs and presents results with confidence scores, risk stratification, and Grad-CAM visual explanations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite (SWC) |
| Styling | Tailwind CSS v3 |
| Component Library | shadcn/ui + Radix UI |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Testing | Vitest |

---

## Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Root component & router
│   ├── index.css            # Global styles & CSS variables
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   ├── Footer.tsx       # Site footer
│   │   ├── GlassCard.tsx    # Glassmorphism card wrapper
│   │   ├── PageHeader.tsx   # Consistent page title block
│   │   ├── ParticleField.tsx # Animated background canvas
│   │   ├── DNAHelix.tsx     # Decorative DNA helix animation
│   │   ├── RiskBadge.tsx    # Color-coded risk level badge
│   │   ├── ConfidenceBar.tsx # Animated probability bar
│   │   ├── MolecularBadge.tsx # Molecular subtype badge
│   │   ├── ImageUploadZone.tsx # Drag-and-drop image input
│   │   └── DisclaimerBox.tsx  # Clinical disclaimer notice
│   ├── pages/
│   │   ├── Index.tsx        # Landing page
│   │   ├── About.tsx        # Platform overview
│   │   ├── UterineClinical.tsx   # Uterine clinical risk tool
│   │   ├── UterineMolecular.tsx  # TCGA molecular subtype tool
│   │   ├── CervicalClinical.tsx  # Cervical clinical risk tool
│   │   ├── CervicalCytology.tsx  # CNN Pap smear classifier
│   │   └── NotFound.tsx     # 404 page
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Mobile breakpoint hook
│   │   └── use-toast.ts     # Toast notification hook
│   └── lib/
│       └── utils.ts         # Utility helpers (cn, etc.)
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## AI Modules

### 1. Uterine Clinical Risk  `/uterine-clinical`
Ensemble clinical risk model predicting uterine cancer risk from patient demographics, surgical findings, and pathology data. Returns a color-coded risk tier with feature importance.

**Backend:** `http://localhost:5001`

---

### 2. Uterine Molecular Prognostics  `/uterine-molecular`
TCGA-UCEC–trained molecular subtype classifier. Predicts POLE/MSI/CNH/CNL subtypes and survival prognosis from genomic and clinical features.

**Backend:** `http://localhost:5002`

---

### 3. Cervical Clinical Risk  `/cervical-clinical`
Evidence-based cervical cancer risk assessment using patient demographics, HPV status, and clinical history. Outputs a stratified risk score with contributing factor breakdown.

**Backend:** `http://localhost:5003`

---

### 4. Cervical Cytology Imaging  `/cervical-cytology`
ResNet-50 CNN trained on the SipakMed dataset. Classifies Pap smear cell images into five cell types and returns a Grad-CAM heatmap overlay highlighting the model's focus regions.

| Class | Clinical Significance |
|---|---|
| Superficial-Intermediate | Normal mature squamous cells |
| Parabasal | Atrophy or regeneration |
| Metaplastic | Benign squamous transformation |
| Koilocytotic | HPV-associated cytopathic changes |
| Dyskeratotic | Possible dysplasia or malignancy |

**Backend:** `http://localhost:5009`

---

## Getting Started

### Prerequisites
- Node.js ≥ 18 or Bun ≥ 1.0
- Backend model servers running (see `/backend/`)

### Install Dependencies

```bash
# with npm
npm install

# or with bun
bun install
```

### Run Development Server

```bash
npm run dev
# or
bun dev
```

The app is served at **http://localhost:8080**

### Build for Production

```bash
npm run build
```

Output is placed in `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite once |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Environment & API Configuration

Backend API URLs are currently defined as constants inside each page component. To change a target URL, update the `API_URL` constant at the top of the relevant page file:

```ts
// src/pages/CervicalCytology.tsx
const API_URL = "http://localhost:5009/predict/cervical";
```

---

## Design System

- **Glassmorphism** cards with backdrop blur and subtle borders
- **CSS custom properties** for primary gradients and medical color tokens (`medical-teal`, `medical-indigo`, `risk-*`)
- **Framer Motion** for page transitions, staggered list animations, and animated confidence bars
- **Dark / Light** theme support via `next-themes`
- Responsive layout with a mobile-first Tailwind grid

---

## Disclaimer

> GynoVision AI is intended as a **clinical decision-support tool only**. It is not a substitute for professional medical judgment. All model outputs must be interpreted by qualified healthcare professionals in conjunction with full patient history and relevant investigations.

---

## License

Private — All rights reserved.
