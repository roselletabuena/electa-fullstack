# Quickstart & Verification Guide: Hackathon Project Submission API & Track Tagging Service

**Feature ID**: `043-hackathon-project-submission-api`  
**Ticket**: [VS-112](https://the-three-devsketeers.atlassian.net/browse/VS-112)  

---

## 1. Overview & Setup

This guide provides instructions to verify the Hackathon Project Submission API and Track Tagging Service locally.

### Prerequisites
- Node.js 20+
- PostgreSQL database connected via `.env` (or mock DB for unit tests)
- Prisma Client generated with new models (`npm run prisma:generate`)

---

## 2. Verification Scenarios

### Scenario A: Happy Path Submission
Submit a valid project entry with GitHub URL, 2 track tags, and team roster:
```bash
curl -X POST "http://localhost:3000/api/events/hackathon-2026/submissions" \
  -H "Content-Type: application/json" \
  -H "Cookie: <SESSION_COOKIE>" \
  -d '{
    "title": "QuantumVote AI",
    "tagline": "AI-driven voter verification and fraud detection",
    "description": "A comprehensive hackathon submission for the AI & Security track.",
    "repositoryUrl": "https://github.com/the-devsketeers/quantum-vote",
    "demoUrl": "https://quantum-vote.vercel.app",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "trackTags": ["AI & Machine Learning", "Open Innovation"],
    "members": [
      { "name": "Alice Dev", "email": "alice@example.com", "role": "Lead Architect" },
      { "name": "Bob Coder", "email": "bob@example.com", "role": "Frontend Engineer" }
    ],
    "links": [
      { "label": "Figma Prototype", "url": "https://www.figma.com/design/example" }
    ]
  }'
```
**Expected Response**: `201 Created` with `ApiResponse<ProjectSubmissionDto>`.

### Scenario B: Invalid Repository URL
```bash
curl -X POST "http://localhost:3000/api/events/hackathon-2026/submissions" \
  -H "Content-Type: application/json" \
  -H "Cookie: <SESSION_COOKIE>" \
  -d '{
    "title": "Invalid Repo Project",
    "description": "Testing invalid repo url.",
    "repositoryUrl": "ftp://not-git.com/repo",
    "trackTags": ["AI"]
  }'
```
**Expected Response**: `400 Bad Request` with `"Must be a valid GitHub or GitLab repository URL."`.

### Scenario C: Post-Deadline Submission
Submitting to an event where `endsAt` has passed:
**Expected Response**: `403 Forbidden` with `"Submission window is closed."`.

---

## 3. Automated Test Suite Execution

Run all unit tests verifying validation, services, and route handlers:
```bash
npm run test:unit tests/unit/hackathons/
```

Run full project verification:
```bash
npm run typecheck
npm run lint
```
