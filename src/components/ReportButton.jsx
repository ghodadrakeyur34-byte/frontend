import React, { useState } from 'react';
import { Flag, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../utils';

const REPORT_REASONS = [
  'Fake/Scam listing',
  'Duplicate listing',
  'Incorrect information',
  'Inappropriate content',
  'Spam',
  'Suspicious seller',
  'Other',
];

export default function ReportButton({ type, targetId, reporterEmail }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, reporterEmail, reason, details }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setReason('');
          setDetails('');
        }, 2000);
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="report-btn"
        onClick={() => setShowModal(true)}
        title="Report this listing"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <Flag size={15} /> Report
      </button>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal report-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flag size={18} color="var(--danger)" /> Report {type === 'listing' ? 'Listing' : 'User'}
              </h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {submitted ? (
              <div className="admin-modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle2 size={48} color="var(--success)" />
                </div>
                <h3 style={{ color: '#10b981' }}>Report Submitted</h3>
                <p style={{ color: 'var(--text3)' }}>Thank you. Our team will review this report.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-field">
                    <label>Reason for reporting</label>
                    <div className="report-reasons">
                      {REPORT_REASONS.map(r => (
                        <label key={r} className={`report-reason-option ${reason === r ? 'selected' : ''}`}>
                          <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Additional details (optional)</label>
                    <textarea
                      rows={3}
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder="Provide any additional information…"
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="admin-btn primary" disabled={!reason || submitting}>
                    {submitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
