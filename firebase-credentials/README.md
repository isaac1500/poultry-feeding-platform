# Firebase Credentials

This folder contains sensitive Firebase credentials that should NOT be committed to version control.

## Files:

1. service-account.json - Firebase Admin SDK service account key
   - Used by backend to authenticate with Firebase
   - Contains private keys - KEEP SECURE!
   - Download from Firebase Console → Project Settings → Service Accounts

## How to set up:

1. Download service account key from Firebase Console
2. Save it as service-account.json in this folder
3. The backend will load it from here
4. This file is in .gitignore - it won't be committed

## Security Warning:

- Never commit this file to GitHub
- Never share this file publicly
- Rotate keys if compromised
- Use environment variables in production
