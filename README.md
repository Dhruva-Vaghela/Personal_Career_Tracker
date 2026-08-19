# Engineering OS

Personal AI-powered Engineering Growth Operating System designed to continuously guide software engineers towards becoming world-class AI Backend Engineers.

## Overview

Engineering OS combines personalized learning, coding practice, a 12-Module Career Guide, interactive AI technical interviewing, code review studio, project reviews, analytics, and GitHub insights into a single unified command center.

## Key Features

- **12-Module Career Guide & Topic Studio**: Complete curriculum from Computer Foundations, Web, Frontend, Backend, Databases, Full-Stack, Software Engineering, DevOps, System Design, AI Engineering, to Interview Readiness. Includes 7-Step learning studios, quizzes, blueprint assessments, practical validations, and topic mastery calculations.
- **Interactive AI Technical Interviewer**: Simulate real technical interview loops with an adaptive AI Staff Engineer that analyzes answers and probes deeper with contextual follow-up questions.
- **Code Review Studio**: Multi-metric code analysis (Correctness, Performance, Security, Architecture) and "Spot the Bugs" code review challenges.
- **Personalized Today's Mission**: AI mentor crafts specific, actionable daily missions based on your active curriculum module and identified topic weaknesses.
- **Progressive Web App (PWA)**: Mobile-optimized, installable web application with offline caching and standalone display.

## Getting Started

```bash
# Clone repository
git clone https://github.com/Dhruva-Vaghela/Personal_Career_Tracker.git
cd Personal_Career_Tracker

# Install dependencies
npm install

# Run dev server
npm run dev

# Production build
npm run build
```

## Environment Setup

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

## Tech Stack

- **Frontend**: React, TypeScript (Strict Mode), Vite, Tailwind CSS, shadcn/ui
- **Routing & SSR**: TanStack Start, TanStack Router
- **State & Data**: Zustand, React Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI Engine**: Google Gemini API
