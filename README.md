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

If you are stuck with "failed to push" or "authentication failed" and nothing else works, follow these steps in your terminal:

### Step 1: Fix the Divergent Branch Error
Run this command to tell Git how to handle different histories:
```bash
git config pull.rebase false
```

### Step 2: Fix Authentication (Token Error)
GitHub does **not** accept your regular password in the terminal. You must use a **Personal Access Token (PAT)**:

1.  **Generate Token**: Go to your GitHub account -> **Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2.  **Generate New**: Click "Generate new token (classic)", name it "OskarShop", and check the **repo** box.
3.  **Copy Token**: Copy the code immediately.
4.  **Terminal Login**: Run `git pull origin main`. 
    *   **Username**: Your GitHub username.
    *   **Password**: **Paste the Token** (it will be invisible while you paste).

### Step 3: Re-login in the Editor
1. Click the **Profile/Account icon** at the bottom-left of the editor.
2. Select **Sign Out**.
3. Click it again and select **Sign in with GitHub**.

### Step 4: The "Force Sync" (Last Resort)
If you want to **discard** what is on GitHub and overwrite it with your **current local code** (this fixes almost all sync errors once you are authenticated):
**WARNING: This will delete any changes on GitHub that are NOT in your local workspace.**
```bash
git push origin main --force
```

---

## Local Development
```bash
npm install
npm run dev
```

**Note:** The onboarding flow exclusively appears when the user has installed the OskarShop PWA to their home screen and is opening it for the very first time. It will never show on a regular browser visit.