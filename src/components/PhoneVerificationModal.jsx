import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, ShieldCheck, X, Loader2, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils';
import {
  setupRecaptcha,
  sendFirebasePhoneOtp,
  formatE164Phone,
  getFirebaseErrorMessage,
} from '../firebase';

export default function PhoneVerificationModal({ isOpen, onClose, currentUser, onVerified }) {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [devCode, setDevCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhoneNumber(currentUser?.phone ? currentUser.phone.replace(/^\+91/, '').trim() : '');
      setOtpCode('');
      setStep('phone');
      setError('');
      setDevCode('');
      setConfirmationResult(null);
      setIsSuccess(false);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    let timer = null;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanDigits = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    const fullPhone = formatE164Phone(cleanDigits, countryCode);

    try {
      // 1. Initialize invisible reCAPTCHA container
      const verifier = setupRecaptcha('firebase-recaptcha-modal', {
        size: 'invisible',
      });

      // 2. Request SMS OTP via Firebase Authentication
      const result = await sendFirebasePhoneOtp(fullPhone, verifier);
      setConfirmationResult(result.confirmationResult);
      setStep('otp');
      setResendTimer(30);
    } catch (firebaseErr) {
      console.warn('[Phone Modal] Firebase SMS error, trying backend fallback:', firebaseErr);
      const errMsg = getFirebaseErrorMessage(firebaseErr);

      // Fallback: If Firebase SMS fails (e.g. quota, domain not in console, or local offline), call backend demo route
      try {
        const res = await apiFetch('/api/auth/send-phone-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStep('otp');
          setResendTimer(30);
          if (data.devCode) {
            setDevCode(data.devCode);
          }
          return;
        }
      } catch (fallbackErr) {}

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let idToken = null;

      // 1. Verify with Firebase if confirmationResult is active
      if (confirmationResult) {
        try {
          const userCredential = await confirmationResult.confirm(code);
          idToken = await userCredential.user.getIdToken();
        } catch (confirmErr) {
          throw new Error(getFirebaseErrorMessage(confirmErr));
        }
      }

      // 2. Synchronize verified phone with backend
      const res = await apiFetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          phone: formatE164Phone(phoneNumber, countryCode),
          idToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (data.user && onVerified) {
          onVerified(data.user);
        }
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal phone-verify-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          padding: '2rem',
          borderRadius: '16px',
          background: 'var(--surface, #1e293b)',
          border: '1px solid rgba(226, 184, 87, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          position: 'relative',
        }}
      >
        <button
          className="login-close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text3)',
            cursor: 'pointer',
            fontSize: '1.25rem',
          }}
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
              Phone Number Verified!
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
              Your mobile number has been authenticated. Submitting request...
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(226, 184, 87, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--accent, #e2b857)',
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text, #f8fafc)' }}>
                {step === 'phone' ? 'Verify Mobile Number' : 'Enter SMS Verification Code'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text2, #94a3b8)', margin: 0 }}>
                {step === 'phone'
                  ? 'To protect buyers and sellers, please verify your mobile number with a quick Firebase SMS OTP.'
                  : `Enter the 6-digit code sent to ${countryCode} ${phoneNumber}.`}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {devCode && step === 'otp' && (
              <div
                style={{
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  color: '#facc15',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                Demo Code: <strong>{devCode}</strong>
              </div>
            )}

            {/* Hidden container for Firebase reCAPTCHA */}
            <div id="firebase-recaptcha-modal"></div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text2, #cbd5e1)',
                      marginBottom: '6px',
                    }}
                  >
                    Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border, #334155)',
                        background: 'var(--surface2, #0f172a)',
                        color: 'var(--accent, #e2b857)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      🇮🇳 {countryCode}
                    </div>
                    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text3, #64748b)' }} />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #334155)',
                          background: 'var(--surface2, #0f172a)',
                          color: 'var(--text, #f8fafc)',
                          fontSize: '0.95rem',
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '4px', display: 'block' }}>
                    Standard SMS rates may apply. Powered by Firebase Authentication.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="btn-submit"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    background: 'var(--accent, #e2b857)',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: loading || phoneNumber.length < 10 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? <Loader2 size={18} className="spin" /> : 'Send Verification Code (SMS)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text2, #cbd5e1)',
                      marginBottom: '6px',
                    }}
                  >
                    6-Digit SMS Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border, #334155)',
                      background: 'var(--surface2, #0f172a)',
                      color: 'var(--text, #f8fafc)',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="btn-submit"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    background: 'var(--accent, #e2b857)',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: loading || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  {loading ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Verify & Confirm
                    </>
                  )}
                </button>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtpCode('');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent, #e2b857)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Change Phone Number
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? 'var(--text3, #64748b)' : 'var(--accent, #e2b857)',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCw size={13} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
