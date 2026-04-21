# Oskar Shop - Game Top-Up & Accounts

A modern, high-performance PWA for gaming top-ups and account trading, built with Next.js 15, Firebase Realtime Database, and Genkit AI.

## Features

- **PWA Ready**: Installable on mobile devices for an app-like experience.
- **Real-time Updates**: Order status and user profiles sync instantly via Firebase Realtime Database.
- **AI Marketing**: Admin tools to generate promotional content using Genkit.
- **Secure Payments**: Integrated mobile payment verification workflow.
- **Responsive Console**: Advanced admin dashboard for inventory and user management.

## Deployment

To deploy this application to **Vercel** or **Netlify**:

### 1. Environment Variables

Set the following variables in your deployment dashboard:

*   `GOOGLE_GENAI_API_KEY`: Your Google AI API key for Genkit.
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_DATABASE_URL`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Found in `src/firebase/config.ts`

### 2. Connect Repository

1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Link the repository to your hosting platform (Vercel/Netlify).
3. The platform will automatically detect the Next.js project and deploy it.

## Troubleshooting Git Issues

If you encounter the error **"failed to push some refs to..."**:

1.  **Pull First**: The remote repository has changes you don't have. Run `git pull origin main` in the terminal or click the `...` in the Source Control panel and select **Pull**.
2.  **Sync Local & Remote**: Use the **Sync Changes** button to ensure your local workspace matches GitHub.
3.  **Check Permissions**: Ensure your GitHub token has "repo" and "workflow" scopes enabled.
4.  **Resolve Conflicts**: If files are modified in both places, you must resolve conflicts before the push will be accepted.
5.  **View Logs**: Always click "Open Git Log" in the error dialog to see the specific error message from GitHub.

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:9002`.
