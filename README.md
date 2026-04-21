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

### "Failed to push some refs" or "Rejected"
The remote repository has changes you don't have. 
1.  **Pull First**: Click the `...` in the Source Control panel and select **Pull**.
2.  **Sync Local & Remote**: Use the **Sync Changes** button.

### "Authentication Failed" or "How to Re-login"
If you cannot pull or push due to a login error or if you revoked your token:
1.  **IDE Re-login**: Look for your GitHub profile icon at the bottom-left of the editor. Click it, sign out, and then sign back in.
2.  **Refresh Connection**: Go to your workspace/project settings dashboard (outside the editor) and look for the "GitHub" or "Integrations" section to reconnect your account.
3.  **Terminal Fix**: If you are comfortable with the terminal, you can force a credential prompt by running:
    ```bash
    git config --global --unset credential.helper
    ```
    Then try to `git pull` again; it should ask for your username and password (or personal access token).

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:9002`.
