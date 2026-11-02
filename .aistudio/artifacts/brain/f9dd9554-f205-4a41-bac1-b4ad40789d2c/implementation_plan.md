# Free Permanent Hosting Plan: Web App & Python Pipeline Deployment

Guide and configuration setup to run both the interactive Web Application (React + Node/Express backend) and the Python Data Science pipeline (`movies_recommendation.py`) together permanently on 100% free cloud tiers.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Confirmed Goal**: Deploy **both** the interactive Web interface and the Python recommendation pipeline in a unified setup.
> - **Zero Cost Requirement**: Utilize reliable, permanent free tiers (no credit card requirements where possible, or permanent Always Free allowances).

---

## 1. Hosting Architecture Options for Unified Deployment

Because your project contains both a **Node.js/TypeScript full-stack app** (`server.ts`, React frontend) and a **Python machine learning environment** (TensorFlow, Surprise, Sentence Transformers, Pandas), here are the top 2 free hosting platforms that support both:

### Option A: Render.com (Recommended - Standard Web Service)
- **Why it fits**: Free Tier web service that connects directly to your GitHub repo.
- **Docker Support**: We can provide a lightweight `Dockerfile` that packages Python 3.10 + Node.js 20 in the same container.
- **Cost**: 100% Free (750 free instance hours per month, automatically sleeps on inactivity and wakes up upon requests).
- **Custom URL & HTTPS**: Free `onrender.com` subdomain with automatic SSL certificate.

### Option B: Hugging Face Spaces (Docker Space)
- **Why it fits**: Designed specifically for machine learning and AI demos.
- **Resources**: Free 2 vCPU, 16 GB RAM (much higher memory for heavy ML models like TensorFlow and Sentence Transformers).
- **Cost**: 100% Free permanent community tier.

---

## 2. Technical Architecture: Multi-Stage Unified Container

```
┌──────────────────────────────────────────────────────────────────┐
│                   Unified Deployment Container                   │
│                                                                  │
│  ┌─────────────────────────┐         ┌────────────────────────┐  │
│  │     Node.js Layer       │         │      Python Layer      │  │
│  │  • Express Web Server   │ ──────> │  • Python 3.10 Runtime │  │
│  │  • React Built Frontend │ API /   │  • Surprise ML Engine  │  │
│  │  • CSV Ingestion Cache  │ Process │  • TensorFlow Keras    │  │
│  │  • Port 3000 (Public)   │         │  • SentenceTransform.  │  │
│  └─────────────────────────┘         └────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Steps to Prepare the Project

1. **Add `Dockerfile`**:
   - Base image: `python:3.10-slim`.
   - Install Node.js 20 and npm.
   - Install Python dependencies (`pandas`, `numpy`, `scikit-learn`, `scikit-surprise`, `tensorflow-cpu`, `sentence-transformers`).
   - Build React production bundle (`npm run build`).
   - Expose port `3000` and start the server with `node dist/server.js` or `npx tsx server.ts`.

2. **Add `.dockerignore`**:
   - Exclude `node_modules`, `__pycache__`, and temporary test artifacts to keep the image fast and light.

3. **Step-by-step Deployment Guide in README**:
   - Include 1-click button or 3-step push guide to Render or Hugging Face.
