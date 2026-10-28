import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, X, Loader2, RotateCw, CheckCircle2, User, AlertCircle } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import { apiFetch } from '../utils';
import {
  setupRecaptcha,
  sendFirebasePhoneOtp,
  formatE164Phone,
  getFirebaseErrorMessage,
} from '../firebase';

export default function LoginModal({ onLogin, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer = null;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Valid 10-digit mobile number is required.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const fullPhone = formatE164Phone(cleanPhone, '+91');
      const verifier = setupRecaptcha('firebase-recaptcha-modal-login', {
        size: 'invisible',
      });

      const result = await sendFirebasePhoneOtp(fullPhone, verifier);
      setConfirmationResult(result.confirmationResult);
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      console.warn('[LoginModal] Firebase SMS error:', err);
      setErrors({ form: getFirebaseErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit verification code.' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (!confirmationResult) {
        throw new Error('Verification session expired. Please request a new code.');
      }

      const userCredential = await confirmationResult.confirm(code);
      const idToken = await userCredential.user.getIdToken();

      const res = await apiFetch('/api/auth/firebase-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (onLogin) onLogin(data.user);
      if (onClose) onClose();
    } catch (err) {
      setErrors({ otp: getFirebaseErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal login-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '2rem', borderRadius: '16px' }}>
        <div className="login-icon" style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(226, 184, 87, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <ShieldCheck size={28} />
        </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '1.35rem' }}>
          {step === 'phone' ? 'Sign In to Mari Milkat' : 'Verify Mobile OTP'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          {step === 'phone'
            ? 'Sign in with your mobile number to access your listings and post properties.'
            : `Enter the 6-digit SMS verification code sent to +91 ${phone}.`}
        </p>

        {/* Google Quick Sign-In */}
        {step === 'phone' && (
          <>
            <GoogleSignInButton
              text="signin_with"
              onAuthSuccess={(user) => {
                if (onLogin) onLogin(user);
                if (onClose) onClose();
              }}
              onError={(err) => setErrors({ form: err })}
            />
            <div className="auth-divider" style={{ margin: '1rem 0' }}>
              <span>OR MOBILE OTP</span>
            </div>
          </>
        )}

        {errors.form && (
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
            <AlertCircle size={16} /> {errors.form}
          </div>
        )}

        {/* Hidden reCAPTCHA container */}
        <div id="firebase-recaptcha-modal-login"></div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className={`form-group ${errors.name ? 'has-error' : ''}`} style={{ marginBottom: '1rem' }}>
              <label htmlFor="modalLoginName" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Name (Optional)</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <User size={18} color="var(--text3)" />
                </span>
                <input
                  type="text"
                  id="modalLoginName"
                  placeholder="Enter Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className={`form-group ${errors.phone ? 'has-error' : ''}`} style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="modalLoginPhone" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mobile Number *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border2)', background: 'var(--bg)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                  🇮🇳 +91
                </div>
                <div className="input-with-icon" style={{ flex: 1, position: 'relative' }}>
                  <span className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Phone size={18} color="var(--text3)" />
                  </span>
                  <input
                    type="tel"
                    id="modalLoginPhone"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    autoFocus
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              {errors.phone && <div className="error-msg show" style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.phone}</div>}
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="btn-submit"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : 'Send Verification OTP (SMS)'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className={`form-group ${errors.otp ? 'has-error' : ''}`} style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="modalLoginOtp" style={{ fontSize: '0.85rem', fontWeight: 600 }}>6-Digit SMS OTP *</label>
              <input
                type="text"
                id="modalLoginOtp"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: '1.25rem',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              />
              {errors.otp && <div className="error-msg show" style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.otp}</div>}
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="btn-submit"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <><CheckCircle2 size={18} /> Verify OTP & Sign In</>}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setErrors({});
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Phone
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleSendOtp}
                style={{ background: 'none', border: 'none', color: resendTimer > 0 ? 'var(--text3)' : 'var(--accent)', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCw size={13} />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <button className="login-close" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: '1.25rem' }}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
