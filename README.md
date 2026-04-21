# Oskar Shop - Game Top-Up & Accounts

A modern, high-performance PWA for gaming top-ups and account trading, built with Next.js 15, Firebase Realtime Database, and Genkit AI.

## Features

- **PWA Ready**: Installable on mobile devices for an app-like experience.
- **Real-time Updates**: Order status and user profiles sync instantly via Firebase Realtime Database.
- **AI Marketing**: Admin tools to generate promotional content using Genkit.
- **Secure Payments**: Integrated mobile payment verification workflow.
- **Responsive Console**: Advanced admin dashboard for inventory and user management.

## Deployment to Vercel or Netlify

To deploy this application, follow these steps:

### 1. Environment Variables

Set the following variables in your deployment dashboard:

*   `GOOGLE_GENAI_API_KEY`: Your Google AI API key for Genkit.
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_DATABASE_URL`: Found in `src/firebase/config.ts`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Found in `src/firebase/config.ts`

### 2. Admin Access

The user with email `admin@lp.com` is automatically granted administrative privileges. You can also manually set `isAdmin: true` in the Realtime Database for any UID.

### 3. Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:9002`.