import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginPage({ onLogin, redirectAfter }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim() || !validateEmail(email.trim())) {
      newErrors.email = t('login.emailError');
    }

    if (!password) {
      newErrors.password = t('login.passwordRequired', 'Password is required');
    } else if (password.length < 3 || password.length > 6) {
      newErrors.password = t('login.passwordLengthError', 'Password must be between 3 and 6 characters');
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
      await onLogin({
        email: email.trim(),
        password,
        name: mode === 'signup' ? name.trim() : undefined,
        phone: mode === 'signup' ? phone.trim() : undefined,
      });
    } catch (err) {
      setErrors({ form: err.message || t('login.formError') });
    } finally {
      setIsSubmitting(false);
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
              <p>
                {t('login.brandDescription')}
              </p>
              <div className="login-features">
                <div className="login-feature">
                  <span className="feature-icon">✅</span>
                  <span>{t('login.featureVerified')}</span>
                </div>
                <div className="login-feature">
                  <span className="feature-icon">📋</span>
                  <span>{t('login.featureManage')}</span>
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
              <div className="login-mode-toggle">
                <button
                  type="button"
                  className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => { setMode('login'); setErrors({}); }}
                >
                  {t('login.signInTab')}
                </button>
                <button
                  type="button"
                  className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); setErrors({}); }}
                >
                  {t('login.createAccountTab')}
                </button>
              </div>

              <h2>
                {mode === 'login' ? t('login.welcomeBack') : t('login.createYourAccount')}
              </h2>
              <p className="login-subtitle">
                {mode === 'login'
                  ? t('login.signInSubtitle')
                  : t('login.signUpSubtitle')}
              </p>

              {errors.form && (
                <div className="login-error-banner">
                  ⚠️ {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form" noValidate>
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
                      minLength={3}
                      maxLength={6}
                      placeholder={
                        mode === 'signup'
                          ? t('login.createPasswordPlaceholder', 'Enter password (3-6 characters)')
                          : t('login.passwordPlaceholder', 'Enter your password (3-6 characters)')
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
                        minLength={3}
                        maxLength={6}
                        placeholder={t('login.confirmPasswordPlaceholder', 'Re-enter your password')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
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
              </form>

              <div className="login-switch">
                {mode === 'login' ? (
                  <p>
                    {t('login.noAccount')}{' '}
                    <button type="button" onClick={() => { setMode('signup'); setErrors({}); }}>
                      {t('login.createOne')}
                    </button>
                  </p>
                ) : (
                  <p>
                    {t('login.haveAccount')}{' '}
                    <button type="button" onClick={() => { setMode('login'); setErrors({}); }}>
                      {t('login.signInLink')}
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
