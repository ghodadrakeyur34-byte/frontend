import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Mail,
  CheckCircle2,
  Lock,
  KeyRound,
  User,
  Phone,
  Eye,
  EyeOff,
  RotateCw,
  ArrowLeft,
  ShieldCheck,
  Info,
  AlertTriangle,
  Smartphone,
  Loader2,
} from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import { apiFetch } from '../utils';
import {
  setupRecaptcha,
  sendFirebasePhoneOtp,
  formatE164Phone,
  getFirebaseErrorMessage,
} from '../firebase';

const REMEMBERED_EMAIL_KEY = 'mari_milkat_remembered_email';
const REMEMBERED_PHONE_KEY = 'mari_milkat_remembered_phone';
const REMEMBER_ME_FLAG = 'mari_milkat_remember_me';

export default function LoginPage({ onLogin, onAuthSuccess, redirectAfter }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('phone'); // 'phone' | 'login' | 'signup' | 'verify'

  // Remember Me state — defaults to true (at least 7 to 30 days)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_ME_FLAG);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  // Pre-fill email & phone from remembered login information if available
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });

  const [phoneLoginNumber, setPhoneLoginNumber] = useState(() => {
    try {
      return localStorage.getItem(REMEMBERED_PHONE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneStep, setPhoneStep] = useState('input'); // 'input' | 'otp'
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState(null);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);
  const [isPhoneSending, setIsPhoneSending] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Email Verification States (for email signup)
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend Email OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Resend Phone OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (phoneResendTimer > 0) {
      interval = setInterval(() => {
        setPhoneResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneResendTimer]);

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  // ===== PHONE OTP VERIFICATION HANDLERS (FIREBASE AUTH) =====
  const handleSendPhoneOtp = async (e) => {
    if (e) e.preventDefault();
    setErrors({});
    setInfoMessage('');

    const clean = phoneLoginNumber.trim().replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setErrors({ phone: t('login.phoneError', 'Valid 10-digit phone number is required') });
      return;
    }

    setIsPhoneSending(true);

    try {
      const fullPhone = formatE164Phone(clean, phoneCountryCode);

      // Setup invisible reCAPTCHA verifier targeting the container
      const verifier = setupRecaptcha('firebase-recaptcha-login', {
        size: 'invisible',
      });

      const result = await sendFirebasePhoneOtp(fullPhone, verifier);
      setPhoneConfirmationResult(result.confirmationResult);
      setPhoneStep('otp');
      setPhoneResendTimer(30);
      setInfoMessage(`${t('login.otpSentMessage', 'We sent a 6-digit verification code via SMS to')} ${phoneCountryCode} ${clean}`);

      // Remember phone if rememberMe is enabled
      if (rememberMe) {
        try {
          localStorage.setItem(REMEMBERED_PHONE_KEY, clean);
          localStorage.setItem(REMEMBER_ME_FLAG, 'true');
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[LoginPage] Firebase SMS failed:', err);
      setErrors({ form: getFirebaseErrorMessage(err) });
    } finally {
      setIsPhoneSending(false);
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    if (e) e.preventDefault();
    setErrors({});
    setInfoMessage('');

    const code = phoneOtpCode.trim();
    if (!code || code.length !== 6) {
      setErrors({ otp: t('login.enterOtpHint', 'Please enter the full 6-digit verification code.') });
      return;
    }

    setIsSubmitting(true);

    try {
      let idToken = null;
      if (phoneConfirmationResult) {
        const userCredential = await phoneConfirmationResult.confirm(code);
        idToken = await userCredential.user.getIdToken();
      } else {
        throw new Error('Verification session expired. Please request a new code.');
      }

      // Sync verified phone credentials with backend
      const res = await apiFetch('/api/auth/firebase-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: phoneName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Phone authentication failed.');
      }

      setInfoMessage('Mobile verified! Signing you in...');

      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(data.user, data.accessToken || data.token, data.refreshToken);
        }
      }, 400);
    } catch (err) {
      setErrors({ otp: getFirebaseErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== EMAIL/PASSWORD FORM SUBMIT HANDLER =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setInfoMessage('');

    if (mode === 'verify') {
      await handleVerifyOtp();
      return;
    }

    if (mode === 'phone') {
      if (phoneStep === 'input') {
        await handleSendPhoneOtp(e);
      } else {
        await handleVerifyPhoneOtp(e);
      }
      return;
    }

    // Admin direct login check
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const lowerPass = cleanPass.toLowerCase();

    // Persist or clear remembered email based on rememberMe checkbox
    if (rememberMe && cleanEmail) {
      try {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail);
        localStorage.setItem(REMEMBER_ME_FLAG, 'true');
        localStorage.setItem('mari_milkat_remember_until', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      } catch (e) {}
    } else if (!rememberMe) {
      try {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        localStorage.setItem(REMEMBER_ME_FLAG, 'false');
        localStorage.removeItem('mari_milkat_remember_until');
      } catch (e) {}
    }

    const isAdminEmail = cleanEmail === 'marimilkatadmin@gmail.com';
    const isAdminPass =
      cleanPass === 'Admin@MariMilkat' ||
      cleanPass === '@dmin@Milkat' ||
      lowerPass === '@dmin@milkat' ||
      lowerPass === 'admin@marimilkat';

    if (isAdminEmail && isAdminPass) {
      setIsSubmitting(true);
      try {
        const res = await apiFetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const adminToken = data.accessToken || data.token;
          const adminPayload = {
            ...(data.admin || { email: cleanEmail, name: 'Admin', role: 'admin', isAdmin: true }),
            token: adminToken,
            refreshToken: data.refreshToken,
          };
          localStorage.setItem('marimilkat_admin', JSON.stringify({ ...data, token: adminToken }));
          if (onAuthSuccess) {
            onAuthSuccess(adminPayload, adminToken, data.refreshToken);
          }
          window.location.hash = '#admin';
          return;
        } else {
          throw new Error(data.error || 'Admin authentication failed');
        }
      } catch (err) {
        setErrors({ form: err.message });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const newErrors = {};

    if (!email.trim() || !validateEmail(email.trim())) {
      newErrors.email = t('login.emailError');
    }

    if (!password) {
      newErrors.password = t('login.passwordRequired', 'Password is required');
    } else if (password.length < 6) {
      newErrors.password = t('login.passwordMinLength', 'Password must be at least 6 characters');
    } else if (password.length > 12) {
      newErrors.password = t('login.passwordMaxLength', 'Password cannot exceed 12 characters');
    }

    if (mode === 'signup') {
      if (!name.trim()) newErrors.name = t('login.nameError');
      if (!phone.trim() || phone.trim().length < 7) {
        newErrors.phone = t('login.phoneError');
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('login.passwordMismatchError', 'Passwords do not match');
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const resData = await onLogin({
        email: email.trim(),
        password,
        name: mode === 'signup' ? name.trim() : undefined,
        phone: mode === 'signup' ? phone.trim() : undefined,
      });

      if (resData?.requiresVerification) {
        setVerifyingEmail(resData.email || email.trim());
        setDevOtpHint(resData.devCode || '');
        setMode('verify');
        setResendTimer(30);
        setOtpCode('');
        setInfoMessage(resData.message || 'Please enter the 6-digit verification code sent to your email.');
      }
    } catch (err) {
      setErrors({ form: err.message || t('login.formError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrors({ otp: 'Please enter the full 6-digit verification code.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setInfoMessage('');

    try {
      const res = await apiFetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifyingEmail,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please check the code and try again.');
      }

      if (data.success && data.user) {
        setInfoMessage('Email verified! Signing you in...');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(data.user, data.accessToken || data.token, data.refreshToken);
          }
        }, 500);
      }
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setErrors({});
    setInfoMessage('');

    try {
      const res = await apiFetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyingEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code.');
      }

      if (data.devCode) {
        setDevOtpHint(data.devCode);
      }
      setResendTimer(30);
      setInfoMessage('A new 6-digit verification code has been sent to your email!');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main id="page-login" className="page active">
      <section className="login-page">
        <div className="login-container">
          {/* Left Panel — Branding */}
          <div className="login-branding">
            <div className="login-branding-content">
              <div className="login-brand-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <Home size={38} color="var(--accent)" />
              </div>
              <h1>
                <span className="gradient-text">Mari</span> Milkat
              </h1>
              <p>{t('login.brandDescription')}</p>
              <div className="login-features">
                <div className="login-feature">
                  <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="var(--accent)" />
                  </div>
                  <span>{t('login.featureVerified')}</span>
                </div>
                <div className="login-feature">
                  <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={20} color="var(--accent)" />
                  </div>
                  <span>{t('login.featureManage')}</span>
                </div>
                <div className="login-feature">
                  <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={20} color="var(--accent)" />
                  </div>
                  <span>{t('login.featureSecure')}</span>
                </div>
              </div>
            </div>
            <div className="login-branding-glow"></div>
          </div>

          {/* Right Panel — Form */}
          <div className="login-form-panel">
            <div className="login-form-wrapper">
              {mode !== 'verify' ? (
                <div className="login-mode-toggle" style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'phone' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('phone');
                      setErrors({});
                      setInfoMessage('');
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Smartphone size={16} />
                    {t('login.phoneTab', 'Mobile OTP')}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('login');
                      setErrors({});
                      setInfoMessage('');
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Mail size={16} />
                    {t('login.signInTab', 'Email')}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('signup');
                      setErrors({});
                      setInfoMessage('');
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <User size={16} />
                    {t('login.createAccountTab', 'Register')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="login-back-link"
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                    setInfoMessage('');
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
              )}

              <h2>
                {mode === 'verify'
                  ? 'Verify Your Email'
                  : mode === 'phone'
                  ? 'Mobile OTP Verification'
                  : mode === 'login'
                  ? t('login.welcomeBack')
                  : t('login.createYourAccount')}
              </h2>

              <p className="login-subtitle">
                {mode === 'verify' ? (
                  <>
                    We sent a 6-digit verification code to{' '}
                    <strong style={{ color: 'var(--accent)' }}>{verifyingEmail}</strong>
                  </>
                ) : mode === 'phone' ? (
                  phoneStep === 'input'
                    ? t('login.phoneSignInSubtitle', 'Sign in or register instantly with your mobile number')
                    : `${t('login.otpSentMessage', 'We sent a 6-digit code to')} ${phoneCountryCode} ${phoneLoginNumber}`
                ) : mode === 'login' ? (
                  t('login.signInSubtitle')
                ) : (
                  t('login.signUpSubtitle')
                )}
              </p>

              {infoMessage && (
                <div className="login-info-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} color="var(--accent)" /> {infoMessage}
                </div>
              )}

              {errors.form && (
                <div className="login-error-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="var(--danger)" /> {errors.form}
                </div>
              )}

              {/* Google Sign-in Option for Quick Access */}
              {mode !== 'verify' && (
                <>
                  <GoogleSignInButton
                    text={mode === 'signup' ? 'signup_with' : 'signin_with'}
                    onAuthSuccess={(user) => {
                      setInfoMessage('Google sign-in verified! Redirecting...');
                      setTimeout(() => {
                        if (onAuthSuccess) onAuthSuccess(user);
                      }, 400);
                    }}
                    onError={(errMsg) => setErrors({ form: errMsg })}
                    disabled={isSubmitting || isPhoneSending}
                  />
                  <div className="auth-divider">
                    <span>{t('login.orDivider', 'OR')}</span>
                  </div>
                </>
              )}

              {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
              <div id="firebase-recaptcha-login"></div>

              {/* =========================================
                  MODE: PHONE OTP (FIREBASE AUTHENTICATION)
                  ========================================= */}
              {mode === 'phone' && (
                <form onSubmit={handleSubmit} className="login-form" noValidate>
                  {phoneStep === 'input' ? (
                    <>
                      <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                        <label htmlFor="phoneLoginInput">{t('login.phoneLabel', 'Mobile Number *')}</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div
                            style={{
                              padding: '0.75rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid var(--border2, #334155)',
                              background: 'var(--bg, #0f172a)',
                              color: 'var(--accent, #e2b857)',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            🇮🇳 {phoneCountryCode}
                          </div>
                          <div className="input-with-icon" style={{ flex: 1 }}>
                            <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                              <Phone size={18} color="var(--text3)" />
                            </span>
                            <input
                              type="tel"
                              id="phoneLoginInput"
                              maxLength={10}
                              placeholder={t('login.phonePlaceholder', 'Enter 10-digit mobile number')}
                              value={phoneLoginNumber}
                              onChange={(e) => setPhoneLoginNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              autoFocus
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                        {errors.phone && <div className="error-msg show">{errors.phone}</div>}
                        <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '4px' }}>
                          Powered by Firebase Phone Authentication with secure SMS verification.
                        </p>
                      </div>

                      {/* Remember Me Checkbox */}
                      <div className="remember-me-row">
                        <label className="remember-me-label" htmlFor="rememberPhoneCheckbox">
                          <input
                            type="checkbox"
                            id="rememberPhoneCheckbox"
                            className="remember-me-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <span>{t('login.rememberMe', 'Remember me on this device')}</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="btn-submit login-submit"
                        disabled={isPhoneSending || phoneLoginNumber.length < 10}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {isPhoneSending ? (
                          <span className="btn-loading">
                            <Loader2 size={18} className="spin" />
                            {t('login.sendingOtp', 'Sending Code...')}
                          </span>
                        ) : (
                          <>
                            <Smartphone size={18} /> {t('login.sendOtp', 'Send Verification Code (SMS)')}
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* OTP Verification Step */}
                      <div className={`form-group ${errors.otp ? 'has-error' : ''}`}>
                        <label htmlFor="phoneOtpCodeInput">{t('login.otpCodeLabel', '6-Digit SMS Code *')}</label>
                        <div className="input-with-icon">
                          <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <ShieldCheck size={18} color="var(--accent)" />
                          </span>
                          <input
                            type="text"
                            id="phoneOtpCodeInput"
                            placeholder="------"
                            maxLength={6}
                            value={phoneOtpCode}
                            onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            autoFocus
                            style={{
                              letterSpacing: '6px',
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              textAlign: 'center',
                            }}
                          />
                        </div>
                        {errors.otp && <div className="error-msg show">{errors.otp}</div>}
                      </div>

                      {/* Optional Name for new profiles */}
                      <div className="form-group">
                        <label htmlFor="phoneUserName">{t('login.optionalName', 'Your Name (Optional)')}</label>
                        <div className="input-with-icon">
                          <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <User size={18} color="var(--text3)" />
                          </span>
                          <input
                            type="text"
                            id="phoneUserName"
                            placeholder={t('login.optionalNamePlaceholder', 'Enter your name for your profile')}
                            value={phoneName}
                            onChange={(e) => setPhoneName(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-submit login-submit"
                        disabled={isSubmitting || phoneOtpCode.length !== 6}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {isSubmitting ? (
                          <span className="btn-loading">
                            <Loader2 size={18} className="spin" />
                            {t('login.verifyingOtp', 'Verifying Code...')}
                          </span>
                        ) : (
                          <>
                            <CheckCircle2 size={18} /> {t('login.verifyAndSignIn', 'Verify OTP & Sign In')}
                          </>
                        )}
                      </button>

                      <div className="verify-resend-row" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-help-link"
                          onClick={() => {
                            setPhoneStep('input');
                            setPhoneOtpCode('');
                            setErrors({});
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                        >
                          {t('login.changePhone', 'Change phone number')}
                        </button>
                        <button
                          type="button"
                          className="btn-resend-otp"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneResendTimer > 0 || isPhoneSending}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: phoneResendTimer > 0 ? 'var(--text3)' : 'var(--accent)', cursor: phoneResendTimer > 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                        >
                          <RotateCw size={14} />
                          {isPhoneSending
                            ? t('login.sendingOtp', 'Sending...')
                            : phoneResendTimer > 0
                            ? `${t('login.resendIn', 'Resend in')} ${phoneResendTimer}s`
                            : t('login.resendCode', 'Resend Code')}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* =========================================
                  MODE: EMAIL LOGIN, SIGNUP, OR EMAIL OTP
                  ========================================= */}
              {mode !== 'phone' && (
                <form onSubmit={handleSubmit} className="login-form" noValidate>
                  {mode === 'verify' ? (
                    <>
                      <div className={`form-group ${errors.otp ? 'has-error' : ''}`}>
                        <label htmlFor="otpCode">6-Digit Code *</label>
                        <div className="input-with-icon">
                          <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <ShieldCheck size={18} color="var(--accent)" />
                          </span>
                          <input
                            type="text"
                            id="otpCode"
                            placeholder="------"
                            value={otpCode}
                            maxLength={6}
                            onChange={(e) =>
                              setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }
                            autoFocus
                            style={{
                              letterSpacing: '6px',
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              textAlign: 'center',
                            }}
                          />
                        </div>
                        {errors.otp && <div className="error-msg show">{errors.otp}</div>}
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
                          💡 Didn't receive the email? Please check your <strong>Spam / Junk folder</strong>.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="btn-submit login-submit"
                        disabled={isSubmitting || otpCode.length !== 6}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {isSubmitting ? (
                          <span className="btn-loading">
                            <span className="spinner-sm"></span>
                            Verifying Code...
                          </span>
                        ) : (
                          <>
                            <Mail size={18} /> Verify Email & Sign In
                          </>
                        )}
                      </button>

                      <div className="verify-resend-row">
                        <button
                          type="button"
                          className="btn-help-link"
                          onClick={() => { window.location.hash = '#help'; }}
                        >
                          Didn't receive the code?
                        </button>
                        <button
                          type="button"
                          className="btn-resend-otp"
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0 || isResending}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RotateCw size={14} />
                          {isResending
                            ? 'Sending...'
                            : resendTimer > 0
                            ? `Resend Code (${resendTimer}s)`
                            : 'Resend Code'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Email — always shown */}
                      <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                        <label htmlFor="loginEmail">{t('login.email')}</label>
                        <div className="input-with-icon">
                          <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <Mail size={18} color="var(--text3)" />
                          </span>
                          <input
                            type="email"
                            id="loginEmail"
                            placeholder={t('login.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && <div className="error-msg show">{errors.email}</div>}
                      </div>

                      {/* Name — signup only */}
                      {mode === 'signup' && (
                        <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                          <label htmlFor="loginName">{t('login.fullName')}</label>
                          <div className="input-with-icon">
                            <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                              <User size={18} color="var(--text3)" />
                            </span>
                            <input
                              type="text"
                              id="loginName"
                              placeholder={t('login.namePlaceholder')}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              autoComplete="name"
                            />
                          </div>
                          {errors.name && <div className="error-msg show">{errors.name}</div>}
                        </div>
                      )}

                      {/* Phone — signup only */}
                      {mode === 'signup' && (
                        <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                          <label htmlFor="loginPhone">{t('login.phone')}</label>
                          <div className="input-with-icon">
                            <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                              <Phone size={18} color="var(--text3)" />
                            </span>
                            <input
                              type="tel"
                              id="loginPhone"
                              placeholder={t('login.phonePlaceholder')}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              autoComplete="tel"
                            />
                          </div>
                          {errors.phone && <div className="error-msg show">{errors.phone}</div>}
                        </div>
                      )}

                      {/* Password field — shown in both login and signup */}
                      <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                        <label htmlFor="loginPassword">
                          {mode === 'signup'
                            ? t('login.createPassword', 'Create Password *')
                            : t('login.password', 'Password *')}
                        </label>
                        <div className="input-with-icon" style={{ position: 'relative' }}>
                          <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <KeyRound size={18} color="var(--text3)" />
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="loginPassword"
                            placeholder={
                              mode === 'signup'
                                ? t('login.createPasswordPlaceholder', 'Enter password (6 to 12 characters)')
                                : t('login.passwordPlaceholder', 'Enter password (6 to 12 characters)')
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            minLength={6}
                            maxLength={12}
                          />
                          <button
                            type="button"
                            className="btn-toggle-pw"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? 'Hide password' : 'Show password'}
                            tabIndex="-1"
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            {showPassword ? <EyeOff size={18} color="var(--text3)" /> : <Eye size={18} color="var(--text3)" />}
                          </button>
                        </div>
                        {errors.password && <div className="error-msg show">{errors.password}</div>}
                      </div>

                      {/* Re-enter Password — signup only */}
                      {mode === 'signup' && (
                        <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                          <label htmlFor="confirmPassword">
                            {t('login.confirmPassword', 'Re-enter Password *')}
                          </label>
                          <div className="input-with-icon" style={{ position: 'relative' }}>
                            <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                              <Lock size={18} color="var(--text3)" />
                            </span>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="confirmPassword"
                              placeholder={t('login.confirmPasswordPlaceholder', 'Re-enter your password')}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              autoComplete="new-password"
                              minLength={6}
                              maxLength={12}
                            />
                          </div>
                          {errors.confirmPassword && (
                            <div className="error-msg show">{errors.confirmPassword}</div>
                          )}
                        </div>
                      )}

                      {/* Remember Me Checkbox (active for at least 7 to 30 days) */}
                      {mode === 'login' && (
                        <div className="remember-me-row">
                          <label className="remember-me-label" htmlFor="rememberMeCheckbox">
                            <input
                              type="checkbox"
                              id="rememberMeCheckbox"
                              className="remember-me-checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>{t('login.rememberMe', 'Remember me on this device')}</span>
                          </label>
                          <span className="remember-me-duration" title={t('login.rememberMeHint', 'Stay signed in and remember your login information')}>
                            🛡️ {t('login.rememberDuration', 'Keeps you signed in for at least 7 to 30 days')}
                          </span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn-submit login-submit"
                        disabled={isSubmitting}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {isSubmitting ? (
                          <span className="btn-loading">
                            <span className="spinner-sm"></span>
                            {t('login.processing')}
                          </span>
                        ) : mode === 'login' ? (
                          <>
                            <KeyRound size={18} /> {t('login.signInBtn')}
                          </>
                        ) : (
                          <>
                            <User size={18} /> {t('login.createAccountBtn')}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              )}

              {/* Bottom Quick Switch Mode */}
              {mode !== 'verify' && (
                <div className="login-switch" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  {mode === 'phone' ? (
                    <p>
                      Prefer using email and password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrors({});
                          setInfoMessage('');
                        }}
                      >
                        Sign in with Email
                      </button>
                    </p>
                  ) : mode === 'login' ? (
                    <p>
                      Want to sign in with your phone?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('phone');
                          setErrors({});
                          setInfoMessage('');
                        }}
                      >
                        Use Mobile OTP
                      </button>
                    </p>
                  ) : (
                    <p>
                      {t('login.haveAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('phone');
                          setErrors({});
                          setInfoMessage('');
                        }}
                      >
                        {t('login.signInLink')}
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
