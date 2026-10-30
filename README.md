# Quizora AI 🎓✨
> **Turn Any Study Material Into Your Next A+.**

Quizora AI is a production-ready, AI-powered quiz generation platform built with React, TypeScript, Vite, Tailwind CSS, Express, and Google Gemini 3.8 Flash. It transforms messy lecture notes, textbook PDFs (digital & scanned), slide decks, and images into rigorous, high-yield practice and exam assessments.

---

## 🌟 Key Features

- **Multimodal Document Processing:**
  - **PDFs:** Text-based and scanned PDFs parsed with native Gemini multimodal OCR vision.
  - **Documents:** Word (`.docx`), PowerPoint (`.pptx`), plain text (`.txt`), and Markdown (`.md`).
  - **Images:** Photos of whiteboard notes or textbook pages (`.jpg`, `.png`, `.webp`).
  - **Direct Paste & Concept Prompts:** Paste raw text or enter any academic topic.
- **Strict Educational Fidelity:**
  - Treats user documents strictly as untrusted source material to prevent prompt injection.
  - Generates questions grounded exclusively in the provided material without fabricating claims.
- **4 Flexible Question Formats:**
  - Multiple Choice (MCQ with 4 distinct options)
  - True / False
  - Multiple Select (with multi-answer validation)
  - Fill in the Blanks (with case-insensitive matching and hint options)
- **Practice vs. Timed Exam Mode:**
  - **Practice Mode:** Check answers instantly and view detailed pedagogical explanations.
  - **Exam Mode:** Full simulated examination with countdown timer, negative marking (`-0.25`), question review flags, and final confirmation.
- **Diagnostic Analytics & Learning:**
  - Detailed question-by-question review with user answer vs correct answer comparisons.
  - Topic-by-topic mastery breakdown.
  - **Retry Missed Questions:** One-click launch to re-test only the questions you got wrong.
  - **Study Guide Export:** Download questions, answers, and explanations in Markdown or print a clean PDF report.
- **Multilingual Assessment:**
  - Supports English, Hindi (हिन्दी), Hinglish, and Marathi (मराठी).
- **100% In-Memory & Privacy-Safe:**
  - Zero permanent disk storage or harvesting of private study notes.
  - Pre-loaded interactive **Demo Quiz** that runs instantly without an API key.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+ recommended)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
git clone <your-repo-url>
cd quizora-ai
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel (Step-by-Step Guide)

Quizora AI is pre-configured with a root `vercel.json` and a serverless API function in `/api/generate.ts`.

### Step 1: Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Push your project code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Quizora AI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.

### Step 3: Configure Environment Variables in Vercel
1. Under the **"Environment Variables"** section in the Vercel project configuration:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Paste your Google Gemini API Key.
2. Ensure **Framework Preset** is set to **Vite** (Vercel will detect `vite build` and output folder `dist` automatically from `vercel.json`).
3. Click **"Deploy"**.

### Step 4: Your Public Website
Once the build completes (usually ~30–45 seconds), Vercel will provide your live public URL (e.g., `https://quizora-ai.vercel.app`).
- No user login is required.
- Anyone with the link can generate quizzes from their own documents or test with the built-in Demo Quiz!

---

## 🛡️ Security Architecture

1. **Server-Side API Key Isolation:**
   - `GEMINI_API_KEY` is strictly accessed on the Node.js server (`server.ts`) or Vercel serverless function (`/api/generate.ts`).
   - Browser client bundles never contain or expose the API key.
2. **Untrusted Data Sanitization:**
   - Uploaded files are ingested as reference material and never executed as code.
   - Built-in rate limiting prevents server overload and API quota exhaustion.
3. **Structured JSON Validation:**
   - Uses the official `@google/genai` TypeScript SDK with strict schema enforcement (`Type.OBJECT` / `Type.ARRAY`) and bounded repair fallbacks.

---

## 📄 License
Apache-2.0
