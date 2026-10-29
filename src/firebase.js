import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB2T1Ru1K6b8V814cxP-mYTz07W7AGoWc4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mari-milkat-49813.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mari-milkat-49813',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mari-milkat-49813.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1005206059754',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1005206059754:web:1fe3598c1f6a4c9d513593',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Z772897054',
};

// Initialize Firebase singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);

/**
 * Format any user-provided phone input to valid E.164 format.
 * Defaults to Indian country code (+91) if not already specified.
 */
export function formatE164Phone(rawInput, defaultCountryCode = '+91') {
  if (!rawInput) return '';
  const clean = String(rawInput).trim().replace(/[\s\-()]/g, '');
  if (clean.startsWith('+')) {
    return clean;
  }
  // Strip leading 0 if present (common local dialing in India)
  const stripped = clean.startsWith('0') ? clean.slice(1) : clean;
  return `${defaultCountryCode}${stripped}`;
}

/**
 * Setup a clean RecaptchaVerifier on a DOM element or invisible.
 * Cleans up previous widget instances to avoid re-render collisions.
 */
export function setupRecaptcha(containerId, options = {}) {
  try {
    if (window._firebaseRecaptchaWidgetId !== undefined && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // Ignore clear errors if already unmounted
      }
    }

    const container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;

    if (!container) {
      throw new Error(`reCAPTCHA container element #${containerId} not found.`);
    }

    // Clear previous DOM children from container
    container.innerHTML = '';

    const verifier = new RecaptchaVerifier(firebaseAuth, container, {
      size: options.size || 'invisible',
      callback: (response) => {
        if (options.onSuccess) options.onSuccess(response);
      },
      'expired-callback': () => {
        if (options.onExpired) options.onExpired();
      },
      ...options,
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.error('[Firebase Auth] Error setting up RecaptchaVerifier:', err);
    throw err;
  }
}

/**
 * Send Phone OTP via Firebase Auth
 */
export async function sendFirebasePhoneOtp(rawPhoneNumber, verifier) {
  const e164Phone = formatE164Phone(rawPhoneNumber);
  if (!e164Phone || e164Phone.length < 10) {
    throw new Error('Please enter a valid mobile number with at least 10 digits.');
  }

  const appVerifier = verifier || window.recaptchaVerifier;
  if (!appVerifier) {
    throw new Error('reCAPTCHA verification is required. Please refresh and try again.');
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, e164Phone, appVerifier);
    return {
      success: true,
      e164Phone,
      confirmationResult,
    };
  } catch (err) {
    console.error('[Firebase Auth] signInWithPhoneNumber error:', err);
    const friendlyError = new Error(getFirebaseErrorMessage(err));
    friendlyError.code = err.code;
    throw friendlyError;
  }
}

/**
 * Map Firebase Auth error codes to user-friendly messages
 */
export function getFirebaseErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/billing-not-enabled' || message.includes('auth/billing-not-enabled') || message.includes('billing-not-enabled')) {
    return 'Phone authentication requires a Firebase Blaze (Pay-as-you-go) plan to send real SMS. To test for free, add your number in Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing.';
  }

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'The mobile number format is invalid. Please check the number and country code.';
    case 'auth/missing-phone-number':
      return 'Mobile number is required.';
    case 'auth/quota-exceeded':
      return 'SMS verification quota exceeded. Please try again later or contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few moments before requesting another code.';
    case 'auth/invalid-verification-code':
      return 'Invalid 6-digit verification code. Please check and try again.';
    case 'auth/code-expired':
      return 'The verification code has expired. Please request a new code.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA check failed. Please refresh the page and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/app-not-authorized':
      return 'Firebase domain not authorized. Please make sure the domain is added in Firebase Console.';
    case 'auth/operation-not-allowed':
      if (message.toLowerCase().includes('region')) {
        return 'SMS for this country/region (+91) is restricted. Please enable India in Firebase Console → Authentication → Settings → SMS Region Policy, or add your test number in Phone provider settings.';
      }
      return 'Phone authentication is disabled. Please enable "Phone" under Firebase Console → Authentication → Sign-in method.';
    default:
      return message || 'Phone verification failed. Please try again.';
  }
}
