import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { animate, stagger } from 'animejs';
import { apiFetch } from '../utils';

export default function HelpDeskView({ userLocation }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    helpMobile: '+91 98765 43210',
    helpEmail: 'support@marimilkat.com',
    helpHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  });
  const [loading, setLoading] = useState(true);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Error loading help desk settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    // Anime.js entrance animation
    animate('.help-card', {
      translateY: [30, 0],
      opacity: [0, 1],
      ease: 'outExpo',
      duration: 1000,
      delay: stagger(150),
    });
  }, [loading]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
      setFormSent(true);
      setFormData({ name: '', phone: '', message: '' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const rawPhone = settings.helpMobile || '';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

  return (
    <main id="page-help" className="page active" style={{ padding: '3rem 5% 5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="inspira-badge" style={{ marginBottom: '1rem' }}>
          <span className="pulse-dot"></span>
          <span>✦ 24/7 Support Desk</span>
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {t('help.title', 'Help Desk & Contact Support')}
        </h1>
        <p style={{ color: 'var(--text2)', maxWidth: '600px', margin: '0 auto' }}>
          {t('help.subtitle', 'Have questions about buying, selling, or property listings? Reach out to our dedicated support team directly.')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Phone Contact Card */}
        <div className="glass-card help-card" style={{ padding: '2rem', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'rgba(226, 184, 87, 0.15)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📞
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('help.mobileTitle', 'Mobile Helpline')}</h3>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            {t('help.mobileDesc', 'Speak directly with our property advisors')}
          </p>
          <a
            href={`tel:${cleanPhone}`}
            className="gradient-text"
            style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textDecoration: 'none' }}
          >
            {settings.helpMobile}
          </a>
          <a
            href={`tel:${cleanPhone}`}
            className="btn-shimmer"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              color: '#000',
              fontWeight: '700',
              textDecoration: 'none',
              width: '100%',
              display: 'inline-block'
            }}
          >
            📲 {t('help.callNow', 'Call Now')}
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="glass-card help-card" style={{ padding: '2rem', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'rgba(34, 197, 94, 0.15)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            💬
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('help.whatsappTitle', 'WhatsApp Chat')}</h3>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            {t('help.whatsappDesc', 'Instant messaging for quick queries & details')}
          </p>
          <div className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {settings.helpMobile}
          </div>
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20MariMilkat%20Support,%20I%20have%20an%20inquiry.`}
            target="_blank"
            rel="noreferrer"
            className="btn-shimmer"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              background: '#22c55e',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              width: '100%',
              display: 'inline-block'
            }}
          >
            💬 {t('help.whatsappBtn', 'Chat on WhatsApp')}
          </a>
        </div>

        {/* Email & Hours Card */}
        <div className="glass-card help-card" style={{ padding: '2rem', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'rgba(99, 102, 241, 0.15)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✉️
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('help.emailTitle', 'Email & Support Hours')}</h3>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {settings.helpEmail}
          </p>
          <p style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            ⏰ {settings.helpHours}
          </p>
          <a
            href={`mailto:${settings.helpEmail}`}
            className="btn-shimmer"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: '600',
              textDecoration: 'none',
              width: '100%',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.05)'
            }}
          >
            ✉️ {t('help.emailBtn', 'Send Email')}
          </a>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="glass-card help-card" style={{ padding: '2.5rem', borderRadius: 'var(--r-xl)', maxWidth: '750px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          📝 {t('help.formTitle', 'Send Us a Direct Message')}
        </h3>
        {formSent ? (
          <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: 'var(--r-md)', textAlign: 'center', color: '#4ade80' }}>
            ✓ {t('help.formSuccess', 'Thank you! Your message has been sent successfully. Our team will contact you shortly.')}
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text2)' }}>
                  {t('help.nameLabel', 'Your Name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text2)' }}>
                  {t('help.phoneLabel', 'Your Mobile Number')}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text2)' }}>
                {t('help.messageLabel', 'Your Message')}
              </label>
              <textarea
                required
                rows="4"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff', resize: 'vertical' }}
              ></textarea>
            </div>
            {submitError && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--r-md)', color: '#f87171', fontSize: '0.9rem' }}>
                ⚠️ {submitError}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-shimmer"
              style={{ padding: '0.9rem', borderRadius: 'var(--r-md)', background: 'var(--accent)', color: '#000', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? '⏳ Submitting...' : `🚀 ${t('help.submitBtn', 'Submit Inquiry')}`}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
