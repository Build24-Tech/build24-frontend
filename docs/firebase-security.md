# Firebase Security Configuration Guide

## Environment Variables Security

### Current Setup
The Firebase configuration uses `NEXT_PUBLIC_` prefixed environment variables. While this exposes configuration values to the client-side, this is **intentional and safe** for Firebase client SDK usage.

### Why This is Safe
1. **Firebase Client SDK Design**: These values are specifically designed to be public and are required for client-side authentication
2. **Security Enforcement**: Actual security is enforced through:
   - Firebase Security Rules (Firestore, Storage, Realtime Database)
   - Firebase App Check
   - Authentication rules and permissions
   - API key restrictions

### Environment Variables Structure
```
# Safe to expose (client-side) - configured via next.config.js
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Keep secret (server-side only)
# These should NOT be exposed to client-side
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Security Best Practices Implemented

### 1. Environment Validation
- Required environment variables are validated at runtime
- Clear error messages for missing configuration
- Application fails fast with descriptive errors

### 2. Security Rules
Ensure your Firebase project has these security rules configured:

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read-only collections
    match /public/{document=**} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }
  }
}
```

#### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. API Key Restrictions
Configure API key restrictions in Firebase Console:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Find your API key used by Firebase
3. Add HTTP referrers restrictions:
   - `https://yourdomain.com/*`
   - `http://localhost:3000/*` (for development)

### 4. App Check (Recommended)
Enable Firebase App Check to prevent unauthorized use:
1. Go to Firebase Console → Project Settings → App Check
2. Enable reCAPTCHA Enterprise for web apps
3. Register your site with reCAPTCHA

## Development vs Production

### Development (.env.local)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=dev_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev_project.firebaseapp.com
# ... other dev values
```

### Production (.env.production)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod_project.firebaseapp.com
# ... other prod values
```

## Verification Steps

1. **Check Environment Variables**
   ```bash
   # All required variables should be set
   echo $NEXT_PUBLIC_FIREBASE_API_KEY
   echo $NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   # ... check all required variables
   ```

2. **Verify Security Rules**
   - Test Firestore rules in Firebase Console simulator
   - Test Storage rules with actual file uploads
   - Verify authentication is required for sensitive operations

3. **Check API Key Restrictions**
   - Attempt access from unauthorized domains (should fail)
   - Verify localhost works for development
   - Verify production domain works

## Common Misconceptions

❌ **"NEXT_PUBLIC_ exposes secrets"** - While these values are visible in client-side code, they are specifically designed for client SDK usage and are not secrets.

✅ **"Security is handled by environment variables"** - Security is actually handled by Firebase Security Rules, proper authentication, and API restrictions.

❌ **"We should hide Firebase config"** - Firebase client SDK requires these values to function; hiding them would break authentication.

## Emergency Response

If you suspect compromise:
1. Immediately regenerate API keys in Firebase Console
2. Update environment variables
3. Review and tighten Security Rules
4. Check Firebase Authentication logs for suspicious activity
5. Enable App Check if not already active
