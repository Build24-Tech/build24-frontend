import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - these values are safe to expose client-side
// as they are specifically designed for client SDK usage
// Security is enforced through Firebase Security Rules and App Check
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Validate required configuration
//const requiredEnvVars = [
//  'FIREBASE_API_KEY',
//  'FIREBASE_AUTH_DOMAIN',
//  'FIREBASE_PROJECT_ID',
//  'FIREBASE_STORAGE_BUCKET',
//  'FIREBASE_MESSAGING_SENDER_ID',
//  'FIREBASE_APP_ID',
//];

//const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

//if (missingEnvVars.length > 0) {
//  console.error('Missing required Firebase environment variables:', missingEnvVars);
//  throw new Error(`Missing required Firebase configuration: ${missingEnvVars.join(', ')}`);
//}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');

githubProvider.addScope('user:email');

appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
