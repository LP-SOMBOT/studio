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

## 🛠 Troubleshooting Git Issues

If you see errors like **"failed to push"** or **"Authentication failed"**, follow these steps in your terminal:

### Fix Divergent Branches
If `git pull` gives a "hint" about divergent branches, run:
```bash
git config pull.rebase false
git pull origin main
```

### Fix Authentication (Token) Error
GitHub no longer accepts your account password for Git. You must use a **Personal Access Token (PAT)**.
1.  **Generate Token**: Go to your GitHub account -> **Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2.  **Permissions**: Click "Generate new token", give it a name, and check the **repo** box.
3.  **Copy Token**: Copy the generated code (you won't see it again).
4.  **Login in Terminal**: Run `git pull origin main`. 
    *   **Username**: Your GitHub username.
    *   **Password**: Paste the **Token** you copied.

### Re-login in IDE
1. Click the **Profile/Account icon** at the bottom-left of the editor.
2. Select **Sign Out**.
3. Click it again and select **Sign in with GitHub**.

---

## Local Development
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:9002`.

**Note:** The onboarding flow exclusively appears when the user has installed the OskarShop PWA to their home screen and is opening it for the very first time. It will never show on a regular browser visit.
