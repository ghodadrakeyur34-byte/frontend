import React, { useState } from 'react';

export default function LoginModal({ onLogin, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = true;
    if (!phone.trim() || phone.trim().length < 7) newErrors.phone = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onLogin({
      name: name.trim(),
      phone: phone.trim(),
      loggedInAt: new Date().toISOString(),
    });
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-icon">👤</div>
        <h2>Sign In to Mari Milkat</h2>
        <p>Enter your details to access your listings and post properties.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="loginName">Your Name *</label>
            <input
              type="text"
              id="loginName"
              placeholder="Enter Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="error-msg">Name is required</div>
          </div>
          <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
            <label htmlFor="loginPhone">Phone Number *</label>
            <input
              type="tel"
              id="loginPhone"
              placeholder=" "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="error-msg">Valid phone number required</div>
          </div>
          <button type="submit" className="btn-submit">Sign In</button>
        </form>
        <button className="login-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
