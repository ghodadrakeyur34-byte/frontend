import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils';

export default function LoginPage({ onLogin, onAuthSuccess, redirectAfter }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'verify'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Email Verification States
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setInfoMessage('');

    if (mode === 'verify') {
      await handleVerifyOtp();
      return;
    }

    // Admin direct login check
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'marimilkatadmin@gmail.com' && (password === '@dmin@Milkat' || password === 'Admin@MariMilkat')) {
      setIsSubmitting(true);
      try {
        const res = await apiFetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem('marimilkat_admin', JSON.stringify(data));
          if (onAuthSuccess) {
            onAuthSuccess(data.admin || { email: cleanEmail, name: 'Admin', role: 'admin', isAdmin: true });
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
        setInfoMessage('✅ Email verified! Signing you in...');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(data.user);
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
      setInfoMessage('📩 A new 6-digit verification code has been sent to your email!');
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
              <div className="login-brand-icon">🏠</div>
              <h1>
                Mari<span>Milkat</span>
              </h1>
              <p>{t('login.brandDescription')}</p>
              <div className="login-features">
                <div className="login-feature">
                  <span className="feature-icon">✉️</span>
                  <span>Email verification required</span>
                </div>
                <div className="login-feature">
                  <span className="feature-icon">✅</span>
                  <span>{t('login.featureVerified')}</span>
                </div>
                <div className="login-feature">
                  <span className="feature-icon">🔒</span>
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
                <div className="login-mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('login');
                      setErrors({});
                      setInfoMessage('');
                    }}
                  >
                    {t('login.signInTab')}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('signup');
                      setErrors({});
                      setInfoMessage('');
                    }}
                  >
                    {t('login.createAccountTab')}
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
                >
                  ← Back to Sign In
                </button>
              )}

              <h2>
                {mode === 'verify'
                  ? 'Verify Your Email'
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
                ) : mode === 'login' ? (
                  t('login.signInSubtitle')
                ) : (
                  t('login.signUpSubtitle')
                )}
              </p>

              {infoMessage && (
                <div className="login-info-banner">
                  ℹ️ {infoMessage}
                </div>
              )}

              {errors.form && (
                <div className="login-error-banner">
                  ⚠️ {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form" noValidate>
                {mode === 'verify' ? (
                  <>
                    <div className={`form-group ${errors.otp ? 'has-error' : ''}`}>
                      <label htmlFor="otpCode">6-Digit Code *</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🔢</span>
                        <input
                          type="text"
                          id="otpCode"
                          placeholder="e.g. 123456"
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
                    </div>

                    <button
                      type="submit"
                      className="btn-submit login-submit"
                      disabled={isSubmitting || otpCode.length !== 6}
                    >
                      {isSubmitting ? (
                        <span className="btn-loading">
                          <span className="spinner-sm"></span>
                          Verifying Code...
                        </span>
                      ) : (
                        '✉️ Verify Email & Sign In'
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
                      >
                        {isResending
                          ? 'Sending...'
                          : resendTimer > 0
                          ? `Resend Code (${resendTimer}s)`
                          : '↻ Resend Code'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Email — always shown */}
                    <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                      <label htmlFor="loginEmail">{t('login.email')}</label>
                      <div className="input-with-icon">
                        <span className="input-icon">📧</span>
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
                          <span className="input-icon">👤</span>
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
                          <span className="input-icon">📱</span>
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
                        <span className="input-icon">🔑</span>
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
                        >
                          {showPassword ? '🙈' : '👁️'}
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
                          <span className="input-icon">🔒</span>
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

                    <button
                      type="submit"
                      className="btn-submit login-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="btn-loading">
                          <span className="spinner-sm"></span>
                          {t('login.processing')}
                        </span>
                      ) : mode === 'login' ? (
                        t('login.signInBtn')
                      ) : (
                        t('login.createAccountBtn')
                      )}
                    </button>
                  </>
                )}
              </form>

              {mode !== 'verify' && (
                <div className="login-switch">
                  {mode === 'login' ? (
                    <p>
                      {t('login.noAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setErrors({});
                          setInfoMessage('');
                        }}
                      >
                        {t('login.createOne')}
                      </button>
                    </p>
                  ) : (
                    <p>
                      {t('login.haveAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
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
