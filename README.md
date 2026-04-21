# Oskar Shop - Game Top-Up & Accounts

A modern, high-performance PWA for gaming top-ups and account trading, built with Next.js 15, Firebase, and Genkit AI.

## Deployment to Vercel or Netlify

To deploy this application to Vercel or Netlify, follow these steps:

### 1. Environment Variables

You must set the following environment variables in your deployment dashboard (Vercel/Netlify):

*   `GOOGLE_GENAI_API_KEY`: Your Google AI API key for Genkit promotional content generation.
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: (Optional if not hardcoded)
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: (Optional if not hardcoded)
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: (Optional if not hardcoded)

*Note: The current Firebase configuration is hardcoded in `src/firebase/config.ts` for convenience.*

### 2. Build Configuration

The app is pre-configured for standard Next.js deployments.

*   **Build Command**: `npm run build`
*   **Install Command**: `npm install`
*   **Output Directory**: `.next`

### 3. PWA Features

The app includes a custom PWA installer. Ensure your deployment domain is served over HTTPS to enable PWA installation and service worker features.

### 4. Admin Setup

The first user to sign up or any user with the email `admin@lp.com` will be granted administrative privileges automatically.

## Local Development

```bash
npm install
npm run dev
```

To start Genkit development tools:
```bash
npm run genkit:dev
```
