# Oskar Shop - Game Top-Up & Accounts

A modern, high-performance PWA for gaming top-ups and account trading, built with Next.js 15, Firebase Realtime Database, and Genkit AI.

## 🚀 Deployment Guide

To deploy this application to **Vercel** or **Netlify**:

### 1. Environment Variables
Set the following variables in your deployment dashboard:
*   `GOOGLE_GENAI_API_KEY`: Your Google AI API key for Genkit.
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_DATABASE_URL`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Found in `src/firebase/config.ts`

### 2. Connect Repository
1. Push your code to a GitHub repository.
2. Link the repository to your hosting platform.

---

## 🛠 Troubleshooting Git Issues (THE NUCLEAR OPTION)

If you are stuck with "failed to push" or "authentication failed" (as seen in your screenshot) and the sidebar shows `11↑`, follow these steps exactly in your **Terminal**:

### Step 1: The "Force Push" Command
Copy and paste this exact line into your terminal and press Enter:
```bash
git push origin main --force
```

### Step 2: Handle Authentication
When you run the command above, Git will likely ask for your credentials:

1.  **Username**: Type your GitHub username and press Enter.
2.  **Password**: **DO NOT use your normal password.** Paste your **Personal Access Token (PAT)** here. (Note: The terminal will not show any characters while you paste/type).

### Step 3: Resetting the IDE Connection
If the error dialog persists in the editor:
1.  Click the **Profile icon** at the very bottom-left of the screen.
2.  Select **Sign Out**.
3.  Click it again and select **Sign in with GitHub**.

---

## Local Development
```bash
npm install
npm run dev
```

**Note:** The onboarding flow exclusively appears when the user has installed the OskarShop PWA to their home screen and is opening it for the very first time. It will never show on a regular browser visit.
